package com.openschedulr.timetable.repository;

import com.openschedulr.timetable.model.TimeSlot;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TimeSlotRepository extends JpaRepository<TimeSlot, UUID> {
}
