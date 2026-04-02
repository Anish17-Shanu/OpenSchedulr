package com.openschedulr.common.seed;

import com.openschedulr.auth.model.Role;
import com.openschedulr.auth.model.User;
import com.openschedulr.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Profile("!test")
@ConditionalOnProperty(prefix = "app.bootstrap-admin", name = "enabled", havingValue = "true", matchIfMissing = true)
public class BootstrapAdminRunner implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap-admin.email}")
    private String email;

    @Value("${app.bootstrap-admin.password}")
    private String password;

    @Override
    public void run(String... args) {
        User admin = userRepository.findByEmailIgnoreCase(email).orElseGet(User::new);
        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);
    }
}
