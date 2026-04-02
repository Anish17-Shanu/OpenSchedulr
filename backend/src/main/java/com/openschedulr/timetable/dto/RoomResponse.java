package com.openschedulr.timetable.dto;

import java.util.UUID;

public record RoomResponse(
        UUID id,
        String name,
        Integer capacity,
        String roomType
) {
}
