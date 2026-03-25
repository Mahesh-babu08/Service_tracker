package com.enterprise.service_tracker.service;

import org.springframework.stereotype.Service;
import java.util.List;
import com.enterprise.service_tracker.entity.Department;
import com.enterprise.service_tracker.Repo.DepartmentRepo;

@Service
public class DepartmentService {

    private final DepartmentRepo departmentRepo;

    public DepartmentService(DepartmentRepo departmentRepo) {
        this.departmentRepo = departmentRepo;
    }

    public Department saveDepartment(Department department) {
        return departmentRepo.save(department);
    }

    public List<Department> getAllDepartments() {
        return departmentRepo.findAll();
    }
}