package com.openschedulr.timetable.repository;

import com.openschedulr.timetable.model.TimetableEntry;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimetableEntryRepository extends JpaRepository<TimetableEntry, UUID> {
    List<TimetableEntry> findAllByFacultyId(UUID facultyId);
}
