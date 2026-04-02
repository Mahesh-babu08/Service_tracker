package com.enterprise.service_tracker.Repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.enterprise.service_tracker.entity.Notification;

public interface NotificationRepo extends JpaRepository<Notification, Long> {

    List<Notification> findAllByOrderByCreatedAtDesc();

    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
}
