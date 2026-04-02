package com.openschedulr.timetable.web;

import com.openschedulr.timetable.dto.CreateRoomRequest;
import com.openschedulr.timetable.dto.CreateTimeSlotRequest;
import com.openschedulr.timetable.dto.RoomResponse;
import com.openschedulr.timetable.dto.TimeSlotResponse;
import com.openschedulr.timetable.service.CatalogService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.UUID;
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
    public RoomResponse createRoom(@Valid @RequestBody CreateRoomRequest request, Principal principal) {
        return catalogService.createRoom(request, principal.getName());
    }

    @GetMapping("/timeslots")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public List<TimeSlotResponse> timeslots() {
        return catalogService.getTimeSlots();
    }

    @PostMapping("/timeslots")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public TimeSlotResponse createTimeSlot(@Valid @RequestBody CreateTimeSlotRequest request, Principal principal) {
        return catalogService.createTimeSlot(request, principal.getName());
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/rooms/{roomId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteRoom(@org.springframework.web.bind.annotation.PathVariable UUID roomId, Principal principal) {
        catalogService.deleteRoom(roomId, principal.getName());
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/timeslots/{timeSlotId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteTimeSlot(@org.springframework.web.bind.annotation.PathVariable UUID timeSlotId, Principal principal) {
        catalogService.deleteTimeSlot(timeSlotId, principal.getName());
    }
}
