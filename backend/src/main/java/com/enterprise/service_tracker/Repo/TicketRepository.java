package com.enterprise.service_tracker.Repo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.enterprise.service_tracker.entity.Department;
import com.enterprise.service_tracker.entity.Ticket;
import com.enterprise.service_tracker.enums.Priority;
import com.enterprise.service_tracker.enums.Status;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    // Raw owner lookup is still used by account deletion/export flows.
    List<Ticket> findByUserId(Long userId);

    // Default user-facing ticket lists should hide tickets deleted by either side.
    List<Ticket> findByUserIdAndDeletedByUserFalseAndDeletedByAdminFalse(Long userId);
    Page<Ticket> findByUserIdAndDeletedByUserFalseAndDeletedByAdminFalse(Long userId, Pageable pageable);
    Page<Ticket> findByUserIdAndDeletedByUserFalseAndDeletedByAdminFalseAndStatus(Long userId, Status status, Pageable pageable);
    Page<Ticket> findByUserIdAndDeletedByUserFalseAndDeletedByAdminFalseAndPriority(Long userId, Priority priority, Pageable pageable);
    Page<Ticket> findByUserIdAndDeletedByUserFalseAndDeletedByAdminFalseAndTitleContainingIgnoreCase(Long userId, String keyword, Pageable pageable);
    List<Ticket> findTop5ByUserIdAndDeletedByUserFalseAndDeletedByAdminFalseOrderByCreatedAtDesc(Long userId);

    // Admin-deleted tickets remain queryable for login notifications.
    List<Ticket> findByUserIdAndDeletedByAdminTrueAndDeletedByUserFalse(Long userId);

    List<Ticket> findByAssignedToId(Long staffId);

    Page<Ticket> findByStatus(Status status, Pageable pageable);
    Page<Ticket> findByPriority(Priority priority, Pageable pageable);
    Page<Ticket> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);

    Page<Ticket> findByDeletedByAdminFalse(Pageable pageable);
    Page<Ticket> findByStatusAndDeletedByAdminFalse(Status status, Pageable pageable);
    Page<Ticket> findByPriorityAndDeletedByAdminFalse(Priority priority, Pageable pageable);
    Page<Ticket> findByTitleContainingIgnoreCaseAndDeletedByAdminFalse(String keyword, Pageable pageable);
    List<Ticket> findByDeletedByAdminFalse();
    List<Ticket> findTop5ByDeletedByAdminFalseOrderByCreatedAtDesc();

    List<Ticket> findByDepartment(Department department);
    List<Ticket> findByDepartmentAndDeletedByAdminFalse(Department department);

    Page<Ticket> findByDepartment(Department department, Pageable pageable);
    Page<Ticket> findByDepartmentAndDeletedByAdminFalse(Department department, Pageable pageable);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.deletedByAdmin = false")
    Long getTotalTickets();

    @Query("SELECT t.status, COUNT(t) FROM Ticket t WHERE t.deletedByAdmin = false GROUP BY t.status")
    List<Object[]> getTicketCountByStatus();

    @Query("SELECT t.department.name, COUNT(t) FROM Ticket t WHERE t.deletedByAdmin = false GROUP BY t.department.name")
    List<Object[]> getTicketCountByDepartment();

    @Query("SELECT t.priority, COUNT(t) FROM Ticket t WHERE t.deletedByAdmin = false GROUP BY t.priority")
    List<Object[]> getTicketCountByPriority();

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.user.id = :userId AND t.deletedByUser = false AND t.deletedByAdmin = false")
    Long getTotalTicketsForUser(@Param("userId") Long userId);

    @Query("SELECT t.status, COUNT(t) FROM Ticket t WHERE t.user.id = :userId AND t.deletedByUser = false AND t.deletedByAdmin = false GROUP BY t.status")
    List<Object[]> getTicketCountByStatusForUser(@Param("userId") Long userId);
}
