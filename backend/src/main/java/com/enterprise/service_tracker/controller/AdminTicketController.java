package com.enterprise.service_tracker.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.enterprise.service_tracker.entity.Ticket;
import com.enterprise.service_tracker.enums.Priority;
import com.enterprise.service_tracker.enums.Status;
import com.enterprise.service_tracker.service.TicketService;

@RestController
@RequestMapping("/api/admin/tickets")
public class AdminTicketController {

    private final TicketService ticketService;

    public AdminTicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @PutMapping("/assign-department/{ticketId}/{departmentId}")
    public ResponseEntity<Ticket> assignDepartment(@PathVariable Long ticketId,
                                                   @PathVariable Long departmentId) {
        return ResponseEntity.ok(ticketService.assignDepartment(ticketId, departmentId));
    }

    @PutMapping("/status/{ticketId}")
    public ResponseEntity<Ticket> updateStatus(@PathVariable Long ticketId,
                                               @RequestParam Status status) {
        return ResponseEntity.ok(ticketService.updateStatus(ticketId, status));
    }

    @PutMapping("/priority/{ticketId}")
    public ResponseEntity<Ticket> updatePriority(@PathVariable Long ticketId,
                                                 @RequestParam Priority priority) {
        return ResponseEntity.ok(ticketService.updatePriority(ticketId, priority));
    }

    @GetMapping("/paginated")
    public ResponseEntity<Page<Ticket>> getPaginatedTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        return ResponseEntity.ok(
                ticketService.getTicketsWithPagination(page, size, sortBy, direction)
        );
    }

    @GetMapping("/filter/status")
    public ResponseEntity<Page<Ticket>> filterByStatus(
            @RequestParam Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {

        return ResponseEntity.ok(
                ticketService.filterByStatus(status, page, size)
        );
    }

    @GetMapping("/filter/priority")
    public ResponseEntity<Page<Ticket>> filterByPriority(
            @RequestParam Priority priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {

        return ResponseEntity.ok(
                ticketService.filterByPriority(priority, page, size)
        );
    }

    @GetMapping("/search")
    public ResponseEntity<Page<Ticket>> searchByTitle(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {

        return ResponseEntity.ok(
                ticketService.searchByTitle(keyword, page, size)
        );
    }
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<Ticket>> getByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(ticketService.getTicketsByDepartment(departmentId));
    }
}
