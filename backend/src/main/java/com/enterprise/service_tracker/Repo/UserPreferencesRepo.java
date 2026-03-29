package com.enterprise.service_tracker.Repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.enterprise.service_tracker.entity.User;
import com.enterprise.service_tracker.entity.UserPreferences;

@Repository
public interface UserPreferencesRepo extends JpaRepository<UserPreferences, Long> {
    Optional<UserPreferences> findByUser(User user);
    Optional<UserPreferences> findByUserId(Long userId);
}