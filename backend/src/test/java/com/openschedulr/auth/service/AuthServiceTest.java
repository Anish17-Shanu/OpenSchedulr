package com.openschedulr.auth.service;

import com.openschedulr.auth.dto.LoginRequest;
import com.openschedulr.auth.model.Role;
import com.openschedulr.auth.model.User;
import com.openschedulr.auth.repository.UserRepository;
import com.openschedulr.auth.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private JwtService jwtService;
    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @Test
    void shouldLoginValidUser() {
        User user = new User();
        user.setEmail("admin@openschedulr.dev");
        user.setPassword("encoded");
        user.setRole(Role.ADMIN);
        when(userRepository.findByEmailIgnoreCase("admin@openschedulr.dev")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("secret", "encoded")).thenReturn(true);
        when(jwtService.generateToken(user.getEmail(), user.getRole())).thenReturn("jwt-token");

        var response = authService.login(new LoginRequest("admin@openschedulr.dev", "secret"));

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.role()).isEqualTo(Role.ADMIN);
    }
}
