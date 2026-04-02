package com.openschedulr.timetable.dto;

import com.openschedulr.timetable.model.EntrySource;
import com.openschedulr.timetable.model.TimetableStatus;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.UUID;

public record TimetableEntryResponse(
        UUID id,
        UUID courseId,
        String courseCode,
        String courseTitle,
        String studentGroup,
        String department,
        String program,
        String batchName,
        String section,
        UUID facultyId,
        String facultyName,
        UUID roomId,
        String roomName,
        UUID timeSlotId,
        DayOfWeek dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        TimetableStatus status,
        EntrySource source
) {
}
