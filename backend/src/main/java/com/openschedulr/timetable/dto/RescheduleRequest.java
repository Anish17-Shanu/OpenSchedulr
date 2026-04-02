package com.openschedulr.timetable.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record RescheduleRequest(
        @NotNull UUID roomId,
        @NotNull UUID timeSlotId
) {
}
