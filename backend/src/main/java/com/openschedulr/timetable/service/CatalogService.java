package com.openschedulr.timetable.service;

import com.openschedulr.timetable.dto.CreateRoomRequest;
import com.openschedulr.timetable.dto.CreateTimeSlotRequest;
import com.openschedulr.timetable.dto.RoomResponse;
import com.openschedulr.timetable.dto.TimeSlotResponse;
import com.openschedulr.timetable.model.Room;
import com.openschedulr.timetable.model.TimeSlot;
import com.openschedulr.timetable.repository.RoomRepository;
import com.openschedulr.timetable.repository.TimeSlotRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final RoomRepository roomRepository;
    private final TimeSlotRepository timeSlotRepository;

    @Transactional(readOnly = true)
    public List<RoomResponse> getRooms() {
        return roomRepository.findAll().stream()
                .map(room -> new RoomResponse(room.getId(), room.getName(), room.getCapacity(), room.getRoomType()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TimeSlotResponse> getTimeSlots() {
        return timeSlotRepository.findAll().stream()
                .map(slot -> new TimeSlotResponse(slot.getId(), slot.getDayOfWeek(), slot.getStartTime(), slot.getEndTime(), slot.getLabel()))
                .toList();
    }

    @Transactional
    public RoomResponse createRoom(CreateRoomRequest request) {
        if (roomRepository.existsByNameIgnoreCase(request.name())) {
            throw new IllegalArgumentException("A room with this name already exists");
        }

        Room room = new Room();
        room.setName(request.name().trim());
        room.setCapacity(request.capacity());
        room.setRoomType(request.roomType().trim());
        Room savedRoom = roomRepository.save(room);
        return new RoomResponse(savedRoom.getId(), savedRoom.getName(), savedRoom.getCapacity(), savedRoom.getRoomType());
    }

    @Transactional
    public TimeSlotResponse createTimeSlot(CreateTimeSlotRequest request) {
        if (!request.endTime().isAfter(request.startTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        if (timeSlotRepository.existsByDayOfWeekAndStartTimeAndEndTime(request.dayOfWeek(), request.startTime(), request.endTime())) {
            throw new IllegalArgumentException("This timeslot already exists");
        }

        TimeSlot timeSlot = new TimeSlot();
        timeSlot.setDayOfWeek(request.dayOfWeek());
        timeSlot.setStartTime(request.startTime());
        timeSlot.setEndTime(request.endTime());
        timeSlot.setLabel(request.label().trim());
        TimeSlot savedSlot = timeSlotRepository.save(timeSlot);
        return new TimeSlotResponse(savedSlot.getId(), savedSlot.getDayOfWeek(), savedSlot.getStartTime(), savedSlot.getEndTime(), savedSlot.getLabel());
    }
}
