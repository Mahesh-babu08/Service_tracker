package com.enterprise.service_tracker.service;

import org.springframework.stereotype.Service;
import java.util.*;

import com.enterprise.service_tracker.Repo.TicketRepository;

@Service
public class ReportService {

    private final TicketRepository ticketRepository;

    public ReportService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public Map<String, Object> getDashboardSummary() {

        Map<String, Object> report = new HashMap<>();

        Long totalTickets = ticketRepository.getTotalTickets();

        List<Object[]> statusData = ticketRepository.getTicketCountByStatus();
        List<Object[]> departmentData = ticketRepository.getTicketCountByDepartment();
        List<Object[]> priorityData = ticketRepository.getTicketCountByPriority();

        report.put("totalTickets", totalTickets);
        report.put("statusSummary", convertToMap(statusData));
        report.put("departmentSummary", convertToMap(departmentData));
        report.put("prioritySummary", convertToMap(priorityData));

        return report;
    }

    private Map<String, Long> convertToMap(List<Object[]> data) {
        Map<String, Long> map = new HashMap<>();

        for (Object[] row : data) {
            map.put(row[0].toString(), (Long) row[1]);
        }

        return map;
    }
}