package com.openschedulr.faculty.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record UpdateFacultyRequest(
        @NotBlank String fullName,
        @NotBlank String department,
        @Min(1) int maxLoad,
        @NotBlank String availability,
        @NotBlank String preferences,
        @NotBlank String subjects
) {
}
