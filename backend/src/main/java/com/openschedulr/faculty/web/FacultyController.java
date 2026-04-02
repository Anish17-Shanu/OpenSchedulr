package com.openschedulr.faculty.web;

import com.openschedulr.common.dto.PageResponse;
import com.openschedulr.faculty.dto.FacultyResponse;
import com.openschedulr.faculty.service.FacultyService;
import com.openschedulr.notification.dto.NotificationResponse;
import com.openschedulr.notification.service.NotificationService;
import com.openschedulr.timetable.dto.TimetableEntryResponse;
import com.openschedulr.timetable.service.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/faculty")
@RequiredArgsConstructor
public class FacultyController {

    private final FacultyService facultyService;
    private final TimetableService timetableService;
    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<FacultyResponse> list(@RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        return facultyService.list(page, size);
    }

    @GetMapping("/dashboard/{facultyId}")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public FacultyResponse profile(@PathVariable UUID facultyId) {
        return facultyService.getDashboardProfile(facultyId);
    }

    @GetMapping("/dashboard/{facultyId}/timetable")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public List<TimetableEntryResponse> timetable(@PathVariable UUID facultyId) {
        return timetableService.listByFaculty(facultyId);
    }

    @GetMapping("/dashboard/{email}/notifications")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public List<NotificationResponse> notifications(@PathVariable String email) {
        return notificationService.getRecentNotifications(email);
    }
}
