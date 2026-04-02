package com.openschedulr.auth.dto;

import com.openschedulr.auth.model.Role;

public record AuthResponse(
        String token,
        String email,
        Role role
) {
}
