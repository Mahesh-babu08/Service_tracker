package com.enterprise.service_tracker.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

import com.enterprise.service_tracker.entity.User;

public interface UserRepo extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
}