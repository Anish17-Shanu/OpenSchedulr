package com.openschedulr.scheduling.dto;

import java.util.UUID;

public record LectureDemandResponse(
        UUID id,
        UUID courseId,
        String courseCode,
        String courseTitle,
        UUID facultyId,
        String facultyName,
        int sessionsPerWeek
) {
}
