package com.enterprise.service_tracker.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.enterprise.service_tracker.Repo.DepartmentRepo;
import com.enterprise.service_tracker.Repo.TicketRepository;
import com.enterprise.service_tracker.Repo.UserRepo;
import com.enterprise.service_tracker.entity.Department;
import com.enterprise.service_tracker.entity.Ticket;
import com.enterprise.service_tracker.entity.User;
import com.enterprise.service_tracker.enums.ActionType;
import com.enterprise.service_tracker.enums.Priority;
import com.enterprise.service_tracker.enums.Status;

@Service
public class TicketService {

    private final TicketRepository ticketRepo;
    private final UserRepo userRepo;
    private final DepartmentRepo departmentRepo;
    private final NotificationService notificationService;

    public TicketService(TicketRepository ticketRepo,
                         UserRepo userRepo,
                         DepartmentRepo departmentRepo,
                         NotificationService notificationService) {
        this.ticketRepo = ticketRepo;
        this.userRepo = userRepo;
        this.departmentRepo = departmentRepo;
        this.notificationService = notificationService;
    }

    private User getUserByEmail(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Pageable buildPageable(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        return PageRequest.of(page, size, sort);
    }

    private Map<String, Long> convertToCountMap(List<Object[]> data) {
        Map<String, Long> counts = new HashMap<>();

        for (Object[] row : data) {
            if (row != null && row.length >= 2 && row[0] != null && row[1] != null) {
                counts.put(row[0].toString(), ((Number) row[1]).longValue());
            }
        }

        return counts;
    }

    private long getStatusCount(Map<String, Long> summary, String... keys) {
        long total = 0L;

        for (String key : keys) {
            total += summary.getOrDefault(key, 0L);
        }

        return total;
    }

    public Ticket createTicket(String title, String description,
                               String email, Long departmentId) {

        User user = getUserByEmail(email);

        if (departmentId == null) {
            throw new RuntimeException("Department is required");
        }

        Department dept = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        Ticket ticket = new Ticket(title, description, user, dept);
        Ticket savedTicket = ticketRepo.save(ticket);

        // Persist a bell notification without changing the existing popup flow.
        notificationService.recordTicketAction(savedTicket, email, ActionType.CREATED);

        return savedTicket;
    }

    public List<Ticket> getUserTickets(Long userId) {
        return ticketRepo.findByUserIdAndDeletedByUserFalseAndDeletedByAdminFalse(userId);
    }

    public List<Ticket> getUserTicketsByEmail(String email) {
        User user = getUserByEmail(email);
        return ticketRepo.findByUserIdAndDeletedByUserFalseAndDeletedByAdminFalse(user.getId());
    }

    public List<Ticket> getUserTicketsByEmail(String email, boolean includeDeleted, boolean deletedByAdminOnly) {
        User user = getUserByEmail(email);

        if (deletedByAdminOnly) {
            // User-deleted tickets must never reappear as admin-delete notifications.
            return ticketRepo.findByUserIdAndDeletedByAdminTrueAndDeletedByUserFalse(user.getId());
        }

        if (includeDeleted) {
            return ticketRepo.findByUserId(user.getId());
        }

        return ticketRepo.findByUserIdAndDeletedByUserFalseAndDeletedByAdminFalse(user.getId());
    }

    public Page<Ticket> getUserTicketsByEmailWithPagination(String email, int page, int size) {
        return getUserTicketsByEmailWithPagination(email, page, size, null, null, null);
    }

    public Page<Ticket> getUserTicketsByEmailWithPagination(
            String email,
            int page,
            int size,
            Status status,
            Priority priority,
            String search) {
        User user = getUserByEmail(email);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        // Preserve the current single-filter precedence while letting the requests view use URL filters.
        if (status != null) {
            return ticketRepo.findByUserIdAndDeletedByUserFalseAndDeletedByAdminFalseAndStatus(user.getId(), status, pageable);
        }

        if (priority != null) {
            return ticketRepo.findByUserIdAndDeletedByUserFalseAndDeletedByAdminFalseAndPriority(user.getId(), priority, pageable);
        }

        if (search != null && !search.isBlank()) {
            return ticketRepo.findByUserIdAndDeletedByUserFalseAndDeletedByAdminFalseAndTitleContainingIgnoreCase(
                    user.getId(),
                    search.trim(),
                    pageable
            );
        }

        return ticketRepo.findByUserIdAndDeletedByUserFalseAndDeletedByAdminFalse(user.getId(), pageable);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepo.findByDeletedByAdminFalse();
    }

    public List<Ticket> getTicketsByDepartment(Long departmentId) {
        Department dept = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        return ticketRepo.findByDepartmentAndDeletedByAdminFalse(dept);
    }

    public Ticket assignTicket(Long ticketId, Long staffId) {

        Ticket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User staff = userRepo.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        ticket.setAssignedTo(staff);

        return ticketRepo.save(ticket);
    }

    public Ticket assignDepartment(Long ticketId, Long departmentId) {

        Ticket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        Department dept = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        ticket.setDepartment(dept);

        return ticketRepo.save(ticket);
    }

    public Ticket updateStatus(Long ticketId, Status status) {

        Ticket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(status);

        return ticketRepo.save(ticket);
    }

    public Ticket updatePriority(Long ticketId, Priority priority) {

        Ticket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setPriority(priority);

        return ticketRepo.save(ticket);
    }

    public void deleteTicket(Long ticketId, String requesterEmail, boolean isAdmin) {
        Ticket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        boolean wasDeletedByUser = ticket.isDeletedByUser();

        if (ticket.isDeletedByAdmin()) {
            throw new RuntimeException("Ticket not found");
        }

        if (isAdmin) {
            // Soft-delete admin removals so the owner can still be notified later.
            ticket.setDeletedByAdmin(true);
            ticket.setDeletionMessage("One of your tickets was deleted by admin");
            ticketRepo.save(ticket);

            if (!wasDeletedByUser) {
                notificationService.recordTicketAction(ticket, requesterEmail, ActionType.DELETED);
            }
            return;
        }

        if (ticket.getUser() == null || !requesterEmail.equalsIgnoreCase(ticket.getUser().getEmail())) {
            throw new AccessDeniedException("You can delete only tickets you created");
        }

        if (ticket.getStatus() == Status.IN_PROGRESS) {
            throw new AccessDeniedException("Tickets that are in progress cannot be deleted");
        }

        if (ticket.isDeletedByUser()) {
            throw new RuntimeException("Ticket not found");
        }

        ticket.setDeletedByUser(true);
        ticket.setDeletionMessage("This ticket was deleted by the user");
        ticketRepo.save(ticket);
        notificationService.recordTicketAction(ticket, requesterEmail, ActionType.DELETED);
    }

    public Map<String, Object> getDashboardData(String email, boolean isAdmin) {
        Map<String, Object> dashboard = new HashMap<>();

        if (isAdmin) {
            Map<String, Long> statusSummary = convertToCountMap(ticketRepo.getTicketCountByStatus());
            Long totalTickets = ticketRepo.getTotalTickets();

            dashboard.put("totalTickets", totalTickets != null ? totalTickets : 0L);
            dashboard.put("pending", getStatusCount(statusSummary, "PENDING"));
            dashboard.put("resolved", getStatusCount(statusSummary, "RESOLVED", "CLOSED"));
            dashboard.put("inProgress", getStatusCount(statusSummary, "IN_PROGRESS", "IN PROGRESS"));
            dashboard.put("statusSummary", statusSummary);
            // Keep the dashboard fast by loading only the latest rows needed for the preview table.
            dashboard.put("recentTickets", ticketRepo.findTop5ByDeletedByAdminFalseOrderByCreatedAtDesc());

            return dashboard;
        }

        User user = getUserByEmail(email);
        Map<String, Long> statusSummary = convertToCountMap(ticketRepo.getTicketCountByStatusForUser(user.getId()));
        Long totalTickets = ticketRepo.getTotalTicketsForUser(user.getId());

        dashboard.put("totalTickets", totalTickets != null ? totalTickets : 0L);
        dashboard.put("pending", getStatusCount(statusSummary, "PENDING"));
        dashboard.put("resolved", getStatusCount(statusSummary, "RESOLVED", "CLOSED"));
        dashboard.put("inProgress", getStatusCount(statusSummary, "IN_PROGRESS", "IN PROGRESS"));
        dashboard.put("statusSummary", statusSummary);
        dashboard.put("recentTickets", ticketRepo.findTop5ByUserIdAndDeletedByUserFalseAndDeletedByAdminFalseOrderByCreatedAtDesc(user.getId()));

        return dashboard;
    }

    public Page<Ticket> getTicketsWithPagination(
            int page,
            int size,
            String sortBy,
            String direction) {

        Pageable pageable = buildPageable(page, size, sortBy, direction);
        return ticketRepo.findByDeletedByAdminFalse(pageable);
    }

    public Page<Ticket> filterByStatus(Status status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ticketRepo.findByStatusAndDeletedByAdminFalse(status, pageable);
    }

    public Page<Ticket> filterByPriority(Priority priority, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ticketRepo.findByPriorityAndDeletedByAdminFalse(priority, pageable);
    }

    public Page<Ticket> searchByTitle(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ticketRepo.findByTitleContainingIgnoreCaseAndDeletedByAdminFalse(keyword, pageable);
    }
}
