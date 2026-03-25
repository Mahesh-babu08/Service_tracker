package com.enterprise.service_tracker.Repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.enterprise.service_tracker.entity.Department;

public interface DepartmentRepo extends JpaRepository<Department, Long> {
}