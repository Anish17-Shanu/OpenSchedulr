package com.openschedulr.faculty.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CreateFacultyRequest(
        @NotBlank String fullName,
        @Email @NotBlank String email,
        @NotBlank String department,
        @Min(1) int maxLoad,
        @NotBlank String availability,
        @NotBlank String preferences,
        String password
) {
}
