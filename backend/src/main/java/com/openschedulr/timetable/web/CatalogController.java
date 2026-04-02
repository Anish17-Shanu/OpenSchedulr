package com.openschedulr.timetable.web;

import com.openschedulr.timetable.dto.CreateRoomRequest;
import com.openschedulr.timetable.dto.CreateTimeSlotRequest;
import com.openschedulr.timetable.dto.RoomResponse;
import com.openschedulr.timetable.dto.TimeSlotResponse;
import com.openschedulr.timetable.service.CatalogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/catalog")
@RequiredArgsConstructor
public class CatalogController {

    private final CatalogService catalogService;

    @GetMapping("/rooms")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public List<RoomResponse> rooms() {
        return catalogService.getRooms();
    }

    @PostMapping("/rooms")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public RoomResponse createRoom(@Valid @RequestBody CreateRoomRequest request) {
        return catalogService.createRoom(request);
    }

    @GetMapping("/timeslots")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public List<TimeSlotResponse> timeslots() {
        return catalogService.getTimeSlots();
    }

    @PostMapping("/timeslots")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public TimeSlotResponse createTimeSlot(@Valid @RequestBody CreateTimeSlotRequest request) {
        return catalogService.createTimeSlot(request);
    }
}
