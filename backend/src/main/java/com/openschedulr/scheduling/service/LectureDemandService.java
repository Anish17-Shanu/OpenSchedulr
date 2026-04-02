package com.openschedulr.scheduling.service;

import com.openschedulr.audit.service.AuditService;
import com.openschedulr.common.exception.NotFoundException;
import com.openschedulr.course.repository.CourseRepository;
import com.openschedulr.faculty.repository.FacultyRepository;
import com.openschedulr.scheduling.dto.CreateLectureDemandRequest;
import com.openschedulr.scheduling.dto.LectureDemandResponse;
import com.openschedulr.scheduling.model.LectureDemand;
import com.openschedulr.scheduling.repository.LectureDemandRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LectureDemandService {

    private final LectureDemandRepository lectureDemandRepository;
    private final CourseRepository courseRepository;
    private final FacultyRepository facultyRepository;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<LectureDemandResponse> listAll() {
        return lectureDemandRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public LectureDemandResponse create(CreateLectureDemandRequest request, String actorEmail) {
        var course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new NotFoundException("Course not found"));
        var faculty = facultyRepository.findById(request.facultyId())
                .orElseThrow(() -> new NotFoundException("Faculty not found"));
        if (lectureDemandRepository.existsByCourseIdAndFacultyId(course.getId(), faculty.getId())) {
            throw new IllegalArgumentException("A lecture demand for this course and faculty already exists");
        }

        LectureDemand demand = new LectureDemand();
        demand.setCourse(course);
        demand.setFaculty(faculty);
        demand.setSessionsPerWeek(request.sessionsPerWeek());
        LectureDemand saved = lectureDemandRepository.save(demand);
        auditService.log(actorEmail, "CREATE_LECTURE_DEMAND", "LectureDemand", saved.getId().toString(),
                "Created " + course.getCode() + " demand for " + faculty.getFullName());
        return toResponse(saved);
    }

    @Transactional
    public LectureDemandResponse update(java.util.UUID demandId, CreateLectureDemandRequest request, String actorEmail) {
        LectureDemand demand = lectureDemandRepository.findById(demandId)
                .orElseThrow(() -> new NotFoundException("Lecture demand not found"));
        var course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new NotFoundException("Course not found"));
        var faculty = facultyRepository.findById(request.facultyId())
                .orElseThrow(() -> new NotFoundException("Faculty not found"));
        demand.setCourse(course);
        demand.setFaculty(faculty);
        demand.setSessionsPerWeek(request.sessionsPerWeek());
        LectureDemand saved = lectureDemandRepository.save(demand);
        auditService.log(actorEmail, "UPDATE_LECTURE_DEMAND", "LectureDemand", demandId.toString(),
                "Updated " + course.getCode() + " demand for " + faculty.getFullName());
        return toResponse(saved);
    }

    @Transactional
    public void delete(java.util.UUID demandId, String actorEmail) {
        LectureDemand demand = lectureDemandRepository.findById(demandId)
                .orElseThrow(() -> new NotFoundException("Lecture demand not found"));
        lectureDemandRepository.delete(demand);
        auditService.log(actorEmail, "DELETE_LECTURE_DEMAND", "LectureDemand", demandId.toString(),
                "Removed " + demand.getCourse().getCode() + " demand for " + demand.getFaculty().getFullName());
    }

    private LectureDemandResponse toResponse(LectureDemand demand) {
        return new LectureDemandResponse(
                demand.getId(),
                demand.getCourse().getId(),
                demand.getCourse().getCode(),
                demand.getCourse().getTitle(),
                demand.getFaculty().getId(),
                demand.getFaculty().getFullName(),
                demand.getSessionsPerWeek());
    }
}
