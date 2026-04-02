package com.enterprise.service_tracker.service;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.enterprise.service_tracker.dto.*;
import com.enterprise.service_tracker.entity.User;
import com.enterprise.service_tracker.entity.Admin;
import com.enterprise.service_tracker.enums.Role;
import com.enterprise.service_tracker.Repo.UserRepo;
import com.enterprise.service_tracker.Repo.AdminRepo;
import com.enterprise.service_tracker.util.JwtUtil;

@Service
public class AuthService {

    private final UserRepo userRepo;
    private final AdminRepo adminRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepo userRepo,
                       AdminRepo adminRepo,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.adminRepo = adminRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // =========================
    // REGISTER
    // =========================
    public String register(RegisterRequest request) {

        // 🔥 Check both tables
        if (userRepo.findByEmail(request.getEmail()).isPresent() ||
            adminRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // 🔥 Register as ADMIN
        if ("ADMIN".equalsIgnoreCase(request.getRole())) {

            Admin admin = new Admin();
            admin.setName(request.getName());
            admin.setEmail(request.getEmail());
            admin.setPassword(passwordEncoder.encode(request.getPassword().trim()));

            adminRepo.save(admin);
            return "Admin registered successfully";
        }

        // 🔥 Default → USER
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        user.setRole(Role.USER);

        userRepo.save(user);

        return "User registered successfully";
    }

    // =========================
    // LOGIN
    // =========================
    public AuthResponse login(LoginRequest request) {

        // 🔥 1. CHECK USER
        var userOpt = userRepo.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (!passwordEncoder.matches(request.getPassword().trim(), user.getPassword())) {
                String dbHash = user.getPassword() != null ? user.getPassword() : "null";
                throw new RuntimeException("Mismatch! DB Hash: '" + dbHash + "' (len: " + dbHash.length() + ") | Your Input: '" + request.getPassword().trim() + "' (len: " + request.getPassword().trim().length() + ")");
            }

            // ✅ include role in JWT
            // Include the name in the JWT so the frontend can render profile details without extra API calls.
            String token = jwtUtil.generateToken(user.getEmail(), "USER", user.getName());

            return new AuthResponse("USER", token, user.getId());
        }

        // 🔥 2. CHECK ADMIN
        var adminOpt = adminRepo.findByEmail(request.getEmail());
        if (adminOpt.isPresent()) {
            Admin admin = adminOpt.get();

            if (!passwordEncoder.matches(request.getPassword().trim(), admin.getPassword())) {
                String dbHash = admin.getPassword() != null ? admin.getPassword() : "null";
                throw new RuntimeException("Admin Mismatch! DB Hash: '" + dbHash + "' (len: " + dbHash.length() + ") | Your Input: '" + request.getPassword().trim() + "' (len: " + request.getPassword().trim().length() + ")");
            }

            // ✅ FIXED: correct token + role
            // Include the name in the JWT so the frontend can render profile details without extra API calls.
            String token = jwtUtil.generateToken(admin.getEmail(), "ADMIN", admin.getName());

            return new AuthResponse("ADMIN", token, admin.getId());
        }

        throw new RuntimeException("Invalid credentials");
    }
}
