package com.openschedulr.course.dto;

import java.util.UUID;

public record CourseResponse(
        UUID id,
        String code,
        String title,
        Integer credits,
        Integer requiredHours,
        String studentGroup,
        String roomType
) {
}
