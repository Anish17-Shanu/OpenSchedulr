package com.openschedulr.course.service;

import com.openschedulr.audit.service.AuditService;
import com.openschedulr.common.exception.NotFoundException;
import com.openschedulr.common.dto.PageResponse;
import com.openschedulr.course.dto.CreateCourseRequest;
import com.openschedulr.course.dto.CourseResponse;
import com.openschedulr.course.dto.UpdateCourseRequest;
import com.openschedulr.course.model.Course;
import com.openschedulr.course.repository.CourseRepository;
import com.openschedulr.scheduling.repository.LectureDemandRepository;
import com.openschedulr.timetable.repository.TimetableEntryRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final LectureDemandRepository lectureDemandRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public PageResponse<CourseResponse> list(int page, int size) {
        var coursePage = courseRepository.findAll(PageRequest.of(page, size));
        return new PageResponse<>(coursePage.stream().map(this::toResponse).toList(), coursePage.getTotalElements());
    }

    @Transactional
    public CourseResponse create(CreateCourseRequest request, String actorEmail) {
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
        course.setDepartment(request.department().trim());
        course.setProgram(request.program().trim());
        course.setBatchName(request.batchName().trim());
        course.setSection(request.section().trim());
        Course saved = courseRepository.save(course);
        auditService.log(actorEmail, "CREATE_COURSE", "Course", saved.getId().toString(), "Created course " + saved.getCode());
        return toResponse(saved);
    }

    @Transactional
    public CourseResponse update(UUID courseId, UpdateCourseRequest request, String actorEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NotFoundException("Course not found"));
        course.setCode(request.code().trim().toUpperCase());
        course.setTitle(request.title().trim());
        course.setCredits(request.credits());
        course.setRequiredHours(request.requiredHours());
        course.setStudentGroup(request.studentGroup().trim());
        course.setRoomType(request.roomType().trim());
        course.setDepartment(request.department().trim());
        course.setProgram(request.program().trim());
        course.setBatchName(request.batchName().trim());
        course.setSection(request.section().trim());
        Course saved = courseRepository.save(course);
        auditService.log(actorEmail, "UPDATE_COURSE", "Course", courseId.toString(), "Updated course " + saved.getCode());
        return toResponse(saved);
    }

    @Transactional
    public void delete(UUID courseId, String actorEmail) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new NotFoundException("Course not found"));
        if (lectureDemandRepository.countByCourseId(courseId) > 0 || timetableEntryRepository.countByCourseId(courseId) > 0) {
            throw new IllegalArgumentException("Remove lecture demands and timetable entries before deleting this course");
        }
        String code = course.getCode();
        courseRepository.delete(course);
        auditService.log(actorEmail, "DELETE_COURSE", "Course", courseId.toString(), "Deleted course " + code);
    }

    public CourseResponse toResponse(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getCode(),
                course.getTitle(),
                course.getCredits(),
                course.getRequiredHours(),
                course.getStudentGroup(),
                course.getRoomType(),
                course.getDepartment(),
                course.getProgram(),
                course.getBatchName(),
                course.getSection());
    }
}
