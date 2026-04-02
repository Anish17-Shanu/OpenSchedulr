package com.openschedulr.scheduling.dto;

import java.util.List;

public record ScheduleGenerationResponse(
        int generatedEntries,
        List<String> warnings
) {
}
