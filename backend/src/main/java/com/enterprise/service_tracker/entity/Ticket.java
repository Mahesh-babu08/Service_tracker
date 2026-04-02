package com.enterprise.service_tracker.entity;

import java.time.LocalDateTime;

import com.enterprise.service_tracker.enums.Priority;
import com.enterprise.service_tracker.enums.Status;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Status status = Status.OPEN;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Priority priority = Priority.MEDIUM;

    // ✅ Ticket owner (VERY IMPORTANT for your requirement)
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ✅ Admin assigns ticket (optional)
    @ManyToOne
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    // ✅ Department (already good)
    @ManyToOne
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    // ✅ Auto timestamp
    private LocalDateTime createdAt = LocalDateTime.now();

    // Soft-delete markers keep history intact for admin review and user notifications.
    private boolean deletedByUser = false;
    private boolean deletedByAdmin = false;

    @Column(columnDefinition = "TEXT")
    private String deletionMessage;

    public Ticket() {}

    public Ticket(String title, String description, User user, Department department) {
        this.title = title;
        this.description = description;
        this.user = user;
        this.department = department;
        this.status = Status.OPEN;
        this.priority = Priority.MEDIUM;
        this.createdAt = LocalDateTime.now();
    }

    // ===== Getters & Setters =====

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }

    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public Status getStatus() { return status; }

    public void setStatus(Status status) { this.status = status; }

    public Priority getPriority() { return priority; }

    public void setPriority(Priority priority) { this.priority = priority; }

    public User getUser() { return user; }

    public void setUser(User user) { this.user = user; }

    public User getAssignedTo() { return assignedTo; }

    public void setAssignedTo(User assignedTo) { this.assignedTo = assignedTo; }

    public Department getDepartment() { return department; }

    public void setDepartment(Department department) { this.department = department; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public boolean isDeletedByUser() { return deletedByUser; }

    public void setDeletedByUser(boolean deletedByUser) { this.deletedByUser = deletedByUser; }

    public boolean isDeletedByAdmin() { return deletedByAdmin; }

    public void setDeletedByAdmin(boolean deletedByAdmin) { this.deletedByAdmin = deletedByAdmin; }

    public String getDeletionMessage() { return deletionMessage; }

    public void setDeletionMessage(String deletionMessage) { this.deletionMessage = deletionMessage; }
}
