package com.openschedulr.course.service;

import com.openschedulr.common.dto.PageResponse;
import com.openschedulr.course.dto.CreateCourseRequest;
import com.openschedulr.course.dto.CourseResponse;
import com.openschedulr.course.model.Course;
import com.openschedulr.course.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;

    @Transactional(readOnly = true)
    public PageResponse<CourseResponse> list(int page, int size) {
        var coursePage = courseRepository.findAll(PageRequest.of(page, size));
        return new PageResponse<>(coursePage.stream().map(this::toResponse).toList(), coursePage.getTotalElements());
    }

    @Transactional
    public CourseResponse create(CreateCourseRequest request) {
        if (courseRepository.existsByCodeIgnoreCase(request.code())) {
            throw new IllegalArgumentException("A course with this code already exists");
        }

        Course course = new Course();
        course.setCode(request.code().trim().toUpperCase());
        course.setTitle(request.title().trim());
        course.setCredits(request.credits());
        course.setRequiredHours(request.requiredHours());
        course.setStudentGroup(request.studentGroup().trim());
        course.setRoomType(request.roomType().trim());
        return toResponse(courseRepository.save(course));
    }

    public CourseResponse toResponse(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getCode(),
                course.getTitle(),
                course.getCredits(),
                course.getRequiredHours(),
                course.getStudentGroup(),
                course.getRoomType());
    }
}
