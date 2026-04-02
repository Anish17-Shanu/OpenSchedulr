package com.openschedulr.faculty.repository;

import com.openschedulr.faculty.model.Faculty;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FacultyRepository extends JpaRepository<Faculty, UUID> {
    Optional<Faculty> findByUser_EmailIgnoreCase(String email);
    List<Faculty> findAllByDepartmentIgnoreCase(String department);
}
