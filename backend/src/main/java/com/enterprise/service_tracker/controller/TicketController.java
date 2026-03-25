package com.enterprise.service_tracker.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.List;

import com.enterprise.service_tracker.entity.Ticket;
import com.enterprise.service_tracker.service.TicketService;
import com.enterprise.service_tracker.enums.Priority;
import com.enterprise.service_tracker.enums.Status;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Map<String, String> request) {

        Ticket ticket = ticketService.createTicket(
                request.get("title"),
                request.get("description"),
                Long.parseLong(request.get("userId")),
                Long.parseLong(request.get("departmentId"))
        );

        return ResponseEntity.ok(ticket);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Ticket>> getUserTickets(@PathVariable Long userId) {
        return ResponseEntity.ok(ticketService.getUserTickets(userId));
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @PutMapping("/assign/{ticketId}/{staffId}")
    public ResponseEntity<Ticket> assignTicket(@PathVariable Long ticketId,
                                               @PathVariable Long staffId) {
        return ResponseEntity.ok(ticketService.assignTicket(ticketId, staffId));
    }

    @PutMapping("/status/{ticketId}")
    public ResponseEntity<Ticket> updateStatus(@PathVariable Long ticketId,
                                               @RequestParam Status status) {
        return ResponseEntity.ok(ticketService.updateStatus(ticketId, status));
    }
    @GetMapping("/paginated")
    public ResponseEntity<Page<Ticket>> getPaginatedTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
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
            @RequestParam(defaultValue = "5") int size) {

        return ResponseEntity.ok(
                ticketService.filterByStatus(status, page, size)
        );
    }
    @GetMapping("/filter/priority")
    public ResponseEntity<Page<Ticket>> filterByPriority(
            @RequestParam Priority priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        return ResponseEntity.ok(
                ticketService.filterByPriority(priority, page, size)
        );
    }
    @GetMapping("/search")
    public ResponseEntity<Page<Ticket>> searchByTitle(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size) {

        return ResponseEntity.ok(
                ticketService.searchByTitle(keyword, page, size)
        );
    }
}