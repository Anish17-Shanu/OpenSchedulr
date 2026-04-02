package com.openschedulr.scheduling.repository;

import com.openschedulr.scheduling.model.LectureDemand;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LectureDemandRepository extends JpaRepository<LectureDemand, UUID> {
    boolean existsByCourseIdAndFacultyId(UUID courseId, UUID facultyId);
    long countByCourseId(UUID courseId);
    long countByFacultyId(UUID facultyId);
}
