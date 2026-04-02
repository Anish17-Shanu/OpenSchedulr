package com.openschedulr.timetable.web;

import com.openschedulr.timetable.dto.RescheduleRequest;
import com.openschedulr.timetable.dto.TimetableEntryResponse;
import com.openschedulr.timetable.service.TimetableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/timetable")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public List<TimetableEntryResponse> list() {
        return timetableService.listAll();
    }

    @GetMapping("/conflicts")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public List<String> conflicts() {
        return timetableService.detectConflicts();
    }

    @PatchMapping("/{entryId}/reschedule")
    @PreAuthorize("hasRole('ADMIN')")
    public TimetableEntryResponse reschedule(@PathVariable UUID entryId,
                                             @Valid @RequestBody RescheduleRequest request,
                                             Principal principal) {
        return timetableService.reschedule(entryId, request, principal.getName());
    }

    @PostMapping("/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public void publish(Principal principal) {
        timetableService.publish(principal.getName());
    }
}
