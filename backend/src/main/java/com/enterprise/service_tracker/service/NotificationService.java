package com.enterprise.service_tracker.service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.enterprise.service_tracker.Repo.AdminRepo;
import com.enterprise.service_tracker.Repo.NotificationRepo;
import com.enterprise.service_tracker.Repo.TicketRepository;
import com.enterprise.service_tracker.Repo.UserRepo;
import com.enterprise.service_tracker.entity.Notification;
import com.enterprise.service_tracker.entity.Ticket;
import com.enterprise.service_tracker.entity.User;
import com.enterprise.service_tracker.enums.ActionType;

@Service
public class NotificationService {

    private final NotificationRepo notificationRepo;
    private final TicketRepository ticketRepo;
    private final UserRepo userRepo;
    private final AdminRepo adminRepo;

    public NotificationService(
            NotificationRepo notificationRepo,
            TicketRepository ticketRepo,
            UserRepo userRepo,
            AdminRepo adminRepo) {
        this.notificationRepo = notificationRepo;
        this.ticketRepo = ticketRepo;
        this.userRepo = userRepo;
        this.adminRepo = adminRepo;
    }

    private User getUserByEmail(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String resolveActorName(String email) {
        return userRepo.findByEmail(email)
                .map(User::getName)
                .filter(name -> name != null && !name.isBlank())
                .or(() -> adminRepo.findByEmail(email)
                        .map(admin -> admin.getName() != null && !admin.getName().isBlank() ? admin.getName() : admin.getEmail()))
                .orElse(email);
    }

    private boolean isVisibleToUser(Notification notification, User user, Map<Long, Ticket> ticketsById) {
        Ticket ticket = ticketsById.get(notification.getTicketId());

        if (ticket == null || ticket.getUser() == null) {
            return false;
        }

        if (!ticket.getUser().getId().equals(user.getId())) {
            return false;
        }

        // Hide notifications for tickets the same user has already removed from their own view.
        return !ticket.isDeletedByUser();
    }

    private String resolveTicketTitle(Ticket ticket) {
        if (ticket == null || ticket.getTitle() == null || ticket.getTitle().isBlank()) {
            return "Untitled Ticket";
        }

        return ticket.getTitle().trim();
    }

    private Notification decorateNotification(Notification notification, Ticket ticket) {
        String ticketTitle = resolveTicketTitle(ticket);

        // Keep bell items human-readable by exposing the title instead of the numeric ticket id.
        notification.setTicketTitle(ticketTitle);
        notification.setMessage(String.format(
                "Ticket \"%s\" has been %s by %s",
                ticketTitle,
                notification.getActionType() == ActionType.CREATED ? "created" : "deleted",
                notification.getCreatedBy()
        ));

        return notification;
    }

    private Ticket getAccessibleTicketForUser(Notification notification, User user) {
        Ticket ticket = ticketRepo.findById(notification.getTicketId())
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (ticket.getUser() == null || !ticket.getUser().getId().equals(user.getId()) || ticket.isDeletedByUser()) {
            throw new AccessDeniedException("You do not have permission to update this notification");
        }

        return ticket;
    }

    public void recordTicketAction(Ticket ticket, String actorEmail, ActionType actionType) {
        if (ticket == null || ticket.getId() == null || ticket.getUser() == null) {
            return;
        }

        String ticketTitle = resolveTicketTitle(ticket);
        Notification notification = new Notification();
        notification.setTicketId(ticket.getId());
        notification.setUserId(ticket.getUser().getId());
        notification.setCreatedBy(resolveActorName(actorEmail));
        notification.setActionType(actionType);
        notification.setMessage(String.format(
                "Ticket \"%s\" has been %s by %s",
                ticketTitle,
                actionType == ActionType.CREATED ? "created" : "deleted",
                notification.getCreatedBy()
        ));
        notification.setTicketTitle(ticketTitle);

        notificationRepo.save(notification);
    }

    public List<Notification> getNotifications(String email, boolean isAdmin) {
        List<Notification> notifications = notificationRepo.findAllByOrderByCreatedAtDesc();
        Map<Long, Ticket> ticketsById = ticketRepo.findAllById(
                notifications.stream().map(Notification::getTicketId).distinct().toList()
        ).stream().collect(Collectors.toMap(Ticket::getId, Function.identity()));

        if (isAdmin) {
            return notifications.stream()
                    .map(notification -> decorateNotification(notification, ticketsById.get(notification.getTicketId())))
                    .toList();
        }

        User user = getUserByEmail(email);

        return notifications.stream()
                .filter(notification -> notification.getUserId().equals(user.getId()))
                .filter(notification -> isVisibleToUser(notification, user, ticketsById))
                .map(notification -> decorateNotification(notification, ticketsById.get(notification.getTicketId())))
                .toList();
    }

    public Notification markAsRead(Long notificationId, String email, boolean isAdmin) {
        Notification notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!isAdmin) {
            User user = getUserByEmail(email);

            if (!user.getId().equals(notification.getUserId())) {
                throw new AccessDeniedException("You do not have permission to update this notification");
            }

            Ticket ticket = getAccessibleTicketForUser(notification, user);
            notification.setRead(true);
            return decorateNotification(notificationRepo.save(notification), ticket);
        }

        notification.setRead(true);
        Ticket ticket = ticketRepo.findById(notification.getTicketId()).orElse(null);
        return decorateNotification(notificationRepo.save(notification), ticket);
    }

    public void deleteNotification(Long notificationId, String email, boolean isAdmin) {
        Notification notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!isAdmin) {
            User user = getUserByEmail(email);

            if (!user.getId().equals(notification.getUserId())) {
                throw new AccessDeniedException("You do not have permission to delete this notification");
            }

            getAccessibleTicketForUser(notification, user);
        }

        notificationRepo.delete(notification);
    }

    public void deleteAllNotifications(String email, boolean isAdmin) {
        // Reuse the existing visibility rules so bulk delete matches what the caller can currently see.
        List<Long> notificationIds = getNotifications(email, isAdmin).stream()
                .map(Notification::getId)
                .toList();

        if (!notificationIds.isEmpty()) {
            notificationRepo.deleteAllByIdInBatch(notificationIds);
        }
    }
}
