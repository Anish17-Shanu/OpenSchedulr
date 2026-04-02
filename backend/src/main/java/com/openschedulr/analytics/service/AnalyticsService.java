package com.openschedulr.analytics.service;

import com.openschedulr.analytics.dto.AnalyticsResponse;
import com.openschedulr.timetable.repository.TimetableEntryRepository;
import com.openschedulr.timetable.service.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TimetableEntryRepository timetableEntryRepository;
    private final TimetableService timetableService;

    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics() {
        var entries = timetableEntryRepository.findAll();
        Map<String, Long> workload = entries.stream()
                .collect(Collectors.groupingBy(entry -> entry.getFaculty().getFullName(), Collectors.counting()));
        Map<String, Long> roomUtilization = entries.stream()
                .collect(Collectors.groupingBy(entry -> entry.getRoom().getName(), Collectors.counting()));
        return new AnalyticsResponse(workload, roomUtilization, entries.size(), timetableService.detectConflicts().size());
    }
}
