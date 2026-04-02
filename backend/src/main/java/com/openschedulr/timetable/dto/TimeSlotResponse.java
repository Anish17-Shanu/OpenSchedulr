package com.openschedulr.timetable.dto;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

public record TimeSlotResponse(
        UUID id,
        DayOfWeek dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        String label
) {
}
