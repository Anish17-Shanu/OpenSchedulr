package com.openschedulr.course.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CreateCourseRequest(
        @NotBlank String code,
        @NotBlank String title,
        @Min(1) int credits,
        @Min(1) int requiredHours,
        @NotBlank String studentGroup,
        @NotBlank String roomType
) {
}
