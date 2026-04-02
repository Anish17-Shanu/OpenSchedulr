package com.openschedulr.timetable.web;

import com.openschedulr.timetable.dto.RoomResponse;
import com.openschedulr.timetable.dto.TimeSlotResponse;
import com.openschedulr.timetable.service.CatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
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

    @GetMapping("/timeslots")
    @PreAuthorize("hasAnyRole('ADMIN','FACULTY')")
    public List<TimeSlotResponse> timeslots() {
        return catalogService.getTimeSlots();
    }
}
