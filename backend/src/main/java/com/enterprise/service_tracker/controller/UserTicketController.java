package com.enterprise.service_tracker.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.Map;
import java.util.List;

import com.enterprise.service_tracker.entity.Ticket;
import com.enterprise.service_tracker.service.TicketService;

@RestController
@RequestMapping("/api/user/tickets")
public class UserTicketController {

    private final TicketService ticketService;

    public UserTicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@RequestBody Map<String, String> request, java.security.Principal principal) {

        String email = principal.getName();
        Long departmentId = null;

        if (request.containsKey("departmentId") && request.get("departmentId") != null && !request.get("departmentId").toString().isEmpty()) {
            departmentId = Long.parseLong(request.get("departmentId"));
        }

        Ticket ticket = ticketService.createTicket(
                request.get("title"),
                request.get("description"),
                email,
                departmentId
        );

        return ResponseEntity.ok(ticket);
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getMyTickets(java.security.Principal principal) {
        return ResponseEntity.ok(ticketService.getUserTicketsByEmail(principal.getName()));
    }
}