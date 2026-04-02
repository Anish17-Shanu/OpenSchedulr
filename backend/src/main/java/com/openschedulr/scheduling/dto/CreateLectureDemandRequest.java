package com.openschedulr.scheduling.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateLectureDemandRequest(
        @NotNull UUID courseId,
        @NotNull UUID facultyId,
        @Min(1) int sessionsPerWeek
) {
}
