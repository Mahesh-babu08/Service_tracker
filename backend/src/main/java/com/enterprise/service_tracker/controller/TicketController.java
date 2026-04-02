package com.enterprise.service_tracker.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import com.enterprise.service_tracker.entity.Ticket;
import com.enterprise.service_tracker.enums.Priority;
import com.enterprise.service_tracker.enums.Status;
import com.enterprise.service_tracker.service.TicketService;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody Map<String, String> request, Principal principal) {
        try {
            String email = principal.getName();
            Long departmentId = null;

            if (request.containsKey("departmentId") && request.get("departmentId") != null && !request.get("departmentId").isEmpty()) {
                departmentId = Long.parseLong(request.get("departmentId"));
            }

            Ticket ticket = ticketService.createTicket(
                    request.get("title"),
                    request.get("description"),
                    email,
                    departmentId
            );

            return ResponseEntity.ok(ticket);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Ticket>> getUserTickets(@PathVariable Long userId) {
        return ResponseEntity.ok(ticketService.getUserTickets(userId));
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyTickets(
            Principal principal,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) Status status,
            @RequestParam(required = false) Priority priority,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "false") boolean includeDeleted,
            @RequestParam(defaultValue = "false") boolean deletedByAdminOnly) {

        if (page != null || size != null || status != null || priority != null || (search != null && !search.isBlank())) {
            int resolvedPage = page != null ? page : 0;
            int resolvedSize = size != null ? size : 6;
            return ResponseEntity.ok(
                    ticketService.getUserTicketsByEmailWithPagination(
                            principal.getName(),
                            resolvedPage,
                            resolvedSize,
                            status,
                            priority,
                            search
                    )
            );
        }

        return ResponseEntity.ok(ticketService.getUserTicketsByEmail(principal.getName(), includeDeleted, deletedByAdminOnly));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(Principal principal, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

        // Shared dashboard payload keeps admin and user cards in sync without changing auth flows.
        return ResponseEntity.ok(ticketService.getDashboardData(principal.getName(), isAdmin));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllTickets(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        if (page != null || size != null) {
            int resolvedPage = page != null ? page : 0;
            int resolvedSize = size != null ? size : 6;
            return ResponseEntity.ok(ticketService.getTicketsWithPagination(resolvedPage, resolvedSize, sortBy, direction));
        }

        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @DeleteMapping("/{ticketId}")
    public ResponseEntity<?> deleteTicket(@PathVariable Long ticketId, Principal principal, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

        try {
            // Users get ownership/status checks; admins keep their soft-delete behavior.
            ticketService.deleteTicket(ticketId, principal.getName(), isAdmin);
            return ResponseEntity.ok(Map.of("message", "Ticket deleted successfully"));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/assign/{ticketId}/{staffId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ticket> assignTicket(@PathVariable Long ticketId,
                                               @PathVariable Long staffId) {
        return ResponseEntity.ok(ticketService.assignTicket(ticketId, staffId));
    }

    @PutMapping("/status/{ticketId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Ticket> updateStatus(@PathVariable Long ticketId,
                                               @RequestParam Status status) {
        return ResponseEntity.ok(ticketService.updateStatus(ticketId, status));
    }

    @GetMapping("/paginated")
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Ticket>> filterByStatus(
            @RequestParam Status status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {

        return ResponseEntity.ok(
                ticketService.filterByStatus(status, page, size)
        );
    }

    @GetMapping("/filter/priority")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Ticket>> filterByPriority(
            @RequestParam Priority priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {

        return ResponseEntity.ok(
                ticketService.filterByPriority(priority, page, size)
        );
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Ticket>> searchByTitle(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {

        return ResponseEntity.ok(
                ticketService.searchByTitle(keyword, page, size)
        );
    }
}
