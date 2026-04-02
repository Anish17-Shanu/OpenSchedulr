package com.openschedulr.scheduling.web;

import com.openschedulr.scheduling.dto.ScheduleGenerationResponse;
import com.openschedulr.scheduling.service.SchedulingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/scheduling")
@RequiredArgsConstructor
public class SchedulingController {

    private final SchedulingService schedulingService;

    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ScheduleGenerationResponse generate(Principal principal) {
        return schedulingService.generateSchedule(principal.getName());
    }
}
