package com.enterprise.service_tracker.service;

import org.springframework.stereotype.Service;
import java.util.List;

import com.enterprise.service_tracker.entity.*;
import com.enterprise.service_tracker.enums.Priority;
import com.enterprise.service_tracker.enums.Status;
import com.enterprise.service_tracker.Repo.*;

import org.springframework.data.domain.*;

@Service
public class TicketService {

    private final TicketRepository ticketRepo;
    private final UserRepo userRepo;
    private final DepartmentRepo departmentRepo;

    public TicketService(TicketRepository ticketRepo,
                         UserRepo userRepo,
                         DepartmentRepo departmentRepo) {
        this.ticketRepo = ticketRepo;
        this.userRepo = userRepo;
        this.departmentRepo = departmentRepo;
    }

    public Ticket createTicket(String title, String description,
                               Long userId, Long departmentId) {

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Department dept = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        Ticket ticket = new Ticket(title, description, user, dept);

        return ticketRepo.save(ticket);
    }

    public List<Ticket> getUserTickets(Long userId) {
        return ticketRepo.findByUserId(userId);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepo.findAll();
    }

    public Ticket assignTicket(Long ticketId, Long staffId) {

        Ticket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User staff = userRepo.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        ticket.setAssignedTo(staff);

        return ticketRepo.save(ticket);
    }

    public Ticket updateStatus(Long ticketId, Status status) {

        Ticket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(status);

        return ticketRepo.save(ticket);
    }


    public Page<Ticket> getTicketsWithPagination(
            int page,
            int size,
            String sortBy,
            String direction) {

        Sort sort = direction.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() :
                Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return ticketRepo.findAll(pageable);
    }
    public Page<Ticket> filterByStatus(Status status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ticketRepo.findByStatus(status, pageable);
    }

    public Page<Ticket> filterByPriority(Priority priority, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ticketRepo.findByPriority(priority, pageable);
    }

    public Page<Ticket> searchByTitle(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ticketRepo.findByTitleContainingIgnoreCase(keyword, pageable);
    }
}