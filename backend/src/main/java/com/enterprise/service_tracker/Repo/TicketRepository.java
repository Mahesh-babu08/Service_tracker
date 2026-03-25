package com.enterprise.service_tracker.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.enterprise.service_tracker.entity.Ticket;
import com.enterprise.service_tracker.enums.Status;
import com.enterprise.service_tracker.enums.Priority;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // ================= BASIC =================

    List<Ticket> findByUserId(Long userId);

    List<Ticket> findByAssignedToId(Long staffId);


    // ================= PAGINATION =================

    Page<Ticket> findAll(Pageable pageable);

    Page<Ticket> findByStatus(Status status, Pageable pageable);

    Page<Ticket> findByPriority(Priority priority, Pageable pageable);

    Page<Ticket> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);


    // ================= REPORTING =================

    @Query("SELECT COUNT(t) FROM Ticket t")
    Long getTotalTickets();

    @Query("SELECT t.status, COUNT(t) FROM Ticket t GROUP BY t.status")
    List<Object[]> getTicketCountByStatus();

    @Query("SELECT t.department.name, COUNT(t) FROM Ticket t GROUP BY t.department.name")
    List<Object[]> getTicketCountByDepartment();

    @Query("SELECT t.priority, COUNT(t) FROM Ticket t GROUP BY t.priority")
    List<Object[]> getTicketCountByPriority();
}