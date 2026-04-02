package com.openschedulr.analytics.web;

import com.openschedulr.analytics.dto.AnalyticsResponse;
import com.openschedulr.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public AnalyticsResponse getAnalytics() {
        return analyticsService.getAnalytics();
    }
}
