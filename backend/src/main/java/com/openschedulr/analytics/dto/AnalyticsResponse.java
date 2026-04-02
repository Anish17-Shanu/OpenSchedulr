package com.openschedulr.analytics.dto;

import java.util.Map;

public record AnalyticsResponse(
        Map<String, Long> workloadDistribution,
        Map<String, Long> roomUtilization,
        long totalEntries,
        long totalConflicts
) {
}
