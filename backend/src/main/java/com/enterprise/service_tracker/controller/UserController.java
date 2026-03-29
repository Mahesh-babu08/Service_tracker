package com.enterprise.service_tracker.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.enterprise.service_tracker.entity.User;
import com.enterprise.service_tracker.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserService authService;

    public UserController(UserService authService) {
        this.authService = authService;
    }

    @PostMapping("/register-user")
    public ResponseEntity<?> register(@RequestBody User user) {
        return ResponseEntity.ok(authService.register(user));
    }

    @PostMapping("/login-user")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {

        String token = authService.login(
                request.get("email"),
                request.get("password")
        );

        return ResponseEntity.ok(Map.of("token", token));
    }
}