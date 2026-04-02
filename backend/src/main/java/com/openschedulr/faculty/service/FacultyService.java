package com.openschedulr.faculty.service;

import com.openschedulr.common.dto.PageResponse;
import com.openschedulr.common.exception.NotFoundException;
import com.openschedulr.faculty.dto.FacultyResponse;
import com.openschedulr.faculty.model.Faculty;
import com.openschedulr.faculty.repository.FacultyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FacultyService {

    private final FacultyRepository facultyRepository;

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
