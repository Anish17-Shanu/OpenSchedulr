package com.openschedulr.faculty.dto;

import java.util.UUID;

public record FacultyResponse(
        UUID id,
        String fullName,
        String email,
        String department,
        Integer maxLoad,
        String availability,
        String preferences
) {
}
