package com.enterprise.service_tracker.dto;

public class AuthResponse {

    private String role;
    private String message;
    private Long userId;   // ✅ important for fetching tickets

    public AuthResponse() {}

    public AuthResponse(String role, String message, Long userId) {
        this.role = role;
        this.message = message;
        this.userId = userId;
    }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}