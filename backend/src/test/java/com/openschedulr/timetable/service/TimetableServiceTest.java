package com.openschedulr.timetable.service;

import com.openschedulr.course.model.Course;
import com.openschedulr.faculty.model.Faculty;
import com.openschedulr.timetable.model.Room;
import com.openschedulr.timetable.model.TimeSlot;
import com.openschedulr.timetable.model.TimetableEntry;
import com.openschedulr.timetable.repository.RoomRepository;
import com.openschedulr.timetable.repository.TimeSlotRepository;
import com.openschedulr.timetable.repository.TimetableEntryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TimetableServiceTest {

    @Mock
    private TimetableEntryRepository timetableEntryRepository;
    @Mock
    private RoomRepository roomRepository;
    @Mock
    private TimeSlotRepository timeSlotRepository;
    @Mock
    private com.openschedulr.notification.service.NotificationService notificationService;
    @Mock
    private com.openschedulr.audit.service.AuditService auditService;

    @InjectMocks
    private TimetableService timetableService;

    @Test
    void shouldDetectFacultyConflict() {
        Faculty faculty = new Faculty();
        faculty.setFullName("Dr. Meera Nair");
        Course course = new Course();
        course.setCode("CS501");
        Room room1 = new Room();
        room1.setName("Lab-1");
        Room room2 = new Room();
        room2.setName("Room-204");
        TimeSlot slot = new TimeSlot();
        slot.setDayOfWeek(DayOfWeek.MONDAY);
        slot.setStartTime(LocalTime.of(9, 0));
        slot.setEndTime(LocalTime.of(10, 0));
        slot.setLabel("Mon 09:00-10:00");

        TimetableEntry first = new TimetableEntry();
        first.setFaculty(faculty);
        first.setCourse(course);
        first.setRoom(room1);
        first.setTimeSlot(slot);

        TimetableEntry second = new TimetableEntry();
        second.setFaculty(faculty);
        second.setCourse(course);
        second.setRoom(room2);
        second.setTimeSlot(slot);

        when(timetableEntryRepository.findAll()).thenReturn(List.of(first, second));

        assertThat(timetableService.detectConflicts()).hasSize(1);
    }
}
