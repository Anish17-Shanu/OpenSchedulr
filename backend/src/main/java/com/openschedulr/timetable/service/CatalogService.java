package com.openschedulr.timetable.service;

import com.openschedulr.timetable.dto.RoomResponse;
import com.openschedulr.timetable.dto.TimeSlotResponse;
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
}
