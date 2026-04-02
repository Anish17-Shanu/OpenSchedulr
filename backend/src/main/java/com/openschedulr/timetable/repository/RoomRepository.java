package com.openschedulr.timetable.repository;

import com.openschedulr.timetable.model.Room;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, UUID> {
}
