package com.openschedulr.auth.service;

import com.openschedulr.auth.dto.AuthResponse;
import com.openschedulr.auth.dto.LoginRequest;
import com.openschedulr.auth.model.User;
import com.openschedulr.auth.repository.UserRepository;
import com.openschedulr.auth.security.JwtService;
import com.openschedulr.common.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email())
                .orElseThrow(() -> new NotFoundException("Invalid credentials"));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new NotFoundException("Invalid credentials");
        }
        return new AuthResponse(jwtService.generateToken(user.getEmail(), user.getRole()), user.getEmail(), user.getRole());
    }
}
