package com.enterprise.service_tracker.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.enterprise.service_tracker.Repo.DepartmentRepo;
import com.enterprise.service_tracker.Repo.TicketRepository;
import com.enterprise.service_tracker.Repo.UserRepo;
import com.enterprise.service_tracker.entity.Department;
import com.enterprise.service_tracker.entity.Ticket;
import com.enterprise.service_tracker.entity.User;
import com.enterprise.service_tracker.enums.Priority;
import com.enterprise.service_tracker.enums.Status;

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

    // =========================
    // CREATE TICKET (USER)
    // =========================
    public Ticket createTicket(String title, String description,
                               String email, Long departmentId) {

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 🔥 Make department mandatory
        if (departmentId == null) {
            throw new RuntimeException("Department is required");
        }

        Department dept = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        Ticket ticket = new Ticket(title, description, user, dept);

        // ✅ Default priority handled in entity (MEDIUM)
        return ticketRepo.save(ticket);
    }

    // =========================
    // USER: OWN TICKETS ONLY
    // =========================
    public List<Ticket> getUserTickets(Long userId) {
        return ticketRepo.findByUserId(userId);
    }

    public List<Ticket> getUserTicketsByEmail(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ticketRepo.findByUserId(user.getId());
    }

    // =========================
    // ADMIN: ALL TICKETS
    // =========================
    public List<Ticket> getAllTickets() {
        return ticketRepo.findAll();
    }

    // =========================
    // ADMIN: FILTER BY DEPARTMENT (NEW)
    // =========================
    public List<Ticket> getTicketsByDepartment(Long departmentId) {
        Department dept = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        return ticketRepo.findByDepartment(dept);
    }

    // =========================
    // ADMIN: ASSIGN STAFF
    // =========================
    public Ticket assignTicket(Long ticketId, Long staffId) {

        Ticket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        User staff = userRepo.findById(staffId)
                .orElseThrow(() -> new RuntimeException("Staff not found"));

        ticket.setAssignedTo(staff);

        return ticketRepo.save(ticket);
    }

    // =========================
    // ADMIN: ASSIGN DEPARTMENT
    // =========================
    public Ticket assignDepartment(Long ticketId, Long departmentId) {

        Ticket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        Department dept = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        ticket.setDepartment(dept);

        return ticketRepo.save(ticket);
    }

    // =========================
    // ADMIN: UPDATE STATUS
    // =========================
    public Ticket updateStatus(Long ticketId, Status status) {

        Ticket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(status);

        return ticketRepo.save(ticket);
    }

    // =========================
    // ADMIN: UPDATE PRIORITY (NEW)
    // =========================
    public Ticket updatePriority(Long ticketId, Priority priority) {

        Ticket ticket = ticketRepo.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setPriority(priority);

        return ticketRepo.save(ticket);
    }

    // =========================
    // PAGINATION + FILTERS
    // =========================
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