package com.openschedulr.faculty.service;

import com.openschedulr.auth.model.Role;
import com.openschedulr.auth.model.User;
import com.openschedulr.auth.repository.UserRepository;
import com.openschedulr.common.dto.PageResponse;
import com.openschedulr.common.exception.NotFoundException;
import com.openschedulr.faculty.dto.CreateFacultyRequest;
import com.openschedulr.faculty.dto.FacultyResponse;
import com.openschedulr.faculty.model.Faculty;
import com.openschedulr.faculty.repository.FacultyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FacultyService {

    private final FacultyRepository facultyRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public PageResponse<FacultyResponse> list(int page, int size) {
        var facultyPage = facultyRepository.findAll(PageRequest.of(page, size));
        return new PageResponse<>(facultyPage.stream().map(this::toResponse).toList(), facultyPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public FacultyResponse getDashboardProfile(UUID facultyId) {
        return facultyRepository.findById(facultyId)
                .map(this::toResponse)
                .orElseThrow(() -> new NotFoundException("Faculty not found"));
    }

    @Transactional
    public FacultyResponse create(CreateFacultyRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new IllegalArgumentException("A user with this email already exists");
        }

        User user = new User();
        user.setEmail(request.email().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(resolvePassword(request.password())));
        user.setRole(Role.FACULTY);

        Faculty faculty = new Faculty();
        faculty.setUser(userRepository.save(user));
        faculty.setFullName(request.fullName().trim());
        faculty.setDepartment(request.department().trim());
        faculty.setMaxLoad(request.maxLoad());
        faculty.setAvailability(request.availability().trim());
        faculty.setPreferences(request.preferences().trim());

        return toResponse(facultyRepository.save(faculty));
    }

    private String resolvePassword(String password) {
        if (password == null || password.isBlank()) {
            return "Faculty@123";
        }
        return password.trim();
    }

    public FacultyResponse toResponse(Faculty faculty) {
        return new FacultyResponse(
                faculty.getId(),
                faculty.getFullName(),
                faculty.getUser().getEmail(),
                faculty.getDepartment(),
                faculty.getMaxLoad(),
                faculty.getAvailability(),
                faculty.getPreferences());
    }
}
