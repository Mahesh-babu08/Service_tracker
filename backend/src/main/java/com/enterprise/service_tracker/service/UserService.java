package com.enterprise.service_tracker.service;

import org.springframework.stereotype.Service;

import com.enterprise.service_tracker.Repo.UserRepo;
import com.enterprise.service_tracker.entity.User;

import java.util.List;

@Service
public class UserService {

    private final UserRepo userRepository;

    public UserService(UserRepo userRepository) {
        this.userRepository = userRepository;
    }

    // =========================
    // GET USER BY EMAIL
    // =========================
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // =========================
    // GET USER BY ID
    // =========================
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // =========================
    // GET ALL USERS (ADMIN USE)
    // =========================
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}