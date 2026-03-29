package com.enterprise.service_tracker.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

import com.enterprise.service_tracker.service.ReportService;

@RestController
@RequestMapping("/api/admin/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        try {
            return ResponseEntity.ok(reportService.getDashboardSummary());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}