package com.enterprise.service_tracker.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.*;

import com.enterprise.service_tracker.entity.Ticket;
import com.enterprise.service_tracker.entity.Department;
import com.enterprise.service_tracker.enums.Status;
import com.enterprise.service_tracker.enums.Priority;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // ✅ USER: only their tickets
    List<Ticket> findByUserId(Long userId);

    // ✅ ASSIGNED tickets
    List<Ticket> findByAssignedToId(Long staffId);

    // ✅ FILTERS
    Page<Ticket> findByStatus(Status status, Pageable pageable);
    Page<Ticket> findByPriority(Priority priority, Pageable pageable);
    Page<Ticket> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);

    // ✅ NEW: Department filtering (IMPORTANT for admin panel)
    List<Ticket> findByDepartment(Department department);

    // ✅ NEW: Department + Pagination
    Page<Ticket> findByDepartment(Department department, Pageable pageable);

    // =========================
    // 📊 REPORT QUERIES
    // =========================

    @Query("SELECT COUNT(t) FROM Ticket t")
    Long getTotalTickets();

    @Query("SELECT t.status, COUNT(t) FROM Ticket t GROUP BY t.status")
    List<Object[]> getTicketCountByStatus();

    @Query("SELECT t.department.name, COUNT(t) FROM Ticket t GROUP BY t.department.name")
    List<Object[]> getTicketCountByDepartment();

    @Query("SELECT t.priority, COUNT(t) FROM Ticket t GROUP BY t.priority")
    List<Object[]> getTicketCountByPriority();
}