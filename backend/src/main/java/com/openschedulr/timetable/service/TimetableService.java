package com.openschedulr.timetable.service;

import com.openschedulr.audit.service.AuditService;
import com.openschedulr.common.exception.NotFoundException;
import com.openschedulr.notification.service.NotificationService;
import com.openschedulr.timetable.dto.RescheduleRequest;
import com.openschedulr.timetable.dto.TimetableEntryResponse;
import com.openschedulr.timetable.model.EntrySource;
import com.openschedulr.timetable.model.TimetableEntry;
import com.openschedulr.timetable.model.TimetableStatus;
import com.openschedulr.timetable.repository.RoomRepository;
import com.openschedulr.timetable.repository.TimeSlotRepository;
import com.openschedulr.timetable.repository.TimetableEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private final TimetableEntryRepository timetableEntryRepository;
    private final RoomRepository roomRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<TimetableEntryResponse> listAll() {
        return timetableEntryRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<TimetableEntryResponse> listByFaculty(UUID facultyId) {
        return timetableEntryRepository.findAllByFacultyId(facultyId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public TimetableEntryResponse reschedule(UUID entryId, RescheduleRequest request, String actorEmail) {
        TimetableEntry entry = timetableEntryRepository.findById(entryId)
                .orElseThrow(() -> new NotFoundException("Timetable entry not found"));
        entry.setRoom(roomRepository.findById(request.roomId()).orElseThrow(() -> new NotFoundException("Room not found")));
        entry.setTimeSlot(timeSlotRepository.findById(request.timeSlotId()).orElseThrow(() -> new NotFoundException("Timeslot not found")));
        entry.setSource(EntrySource.MANUAL);
        TimetableEntry saved = timetableEntryRepository.save(entry);
        notificationService.notifyUser(saved.getFaculty().getUser().getEmail(), "Timetable adjusted",
                "Your session " + saved.getCourse().getCode() + " was rescheduled.");
        auditService.log(actorEmail, "RESCHEDULE_ENTRY", "TimetableEntry", saved.getId().toString(), "Manual override applied");
        return toResponse(saved);
    }

    @Transactional
    public void publish(String actorEmail) {
        List<TimetableEntry> entries = timetableEntryRepository.findAll();
        entries.forEach(entry -> entry.setStatus(TimetableStatus.PUBLISHED));
        timetableEntryRepository.saveAll(entries);
        auditService.log(actorEmail, "PUBLISH_TIMETABLE", "Timetable", "all", "Published timetable");
    }

    @Transactional(readOnly = true)
    public List<String> detectConflicts() {
        List<TimetableEntry> entries = timetableEntryRepository.findAll();
        List<String> conflicts = new ArrayList<>();
        for (int i = 0; i < entries.size(); i++) {
            for (int j = i + 1; j < entries.size(); j++) {
                TimetableEntry left = entries.get(i);
                TimetableEntry right = entries.get(j);
                boolean sameSlot = left.getTimeSlot().getId().equals(right.getTimeSlot().getId());
                if (sameSlot && left.getFaculty().getId().equals(right.getFaculty().getId())) {
                    conflicts.add("Faculty conflict: " + left.getFaculty().getFullName() + " at " + left.getTimeSlot().getLabel());
                }
                if (sameSlot && left.getRoom().getId().equals(right.getRoom().getId())) {
                    conflicts.add("Room conflict: " + left.getRoom().getName() + " at " + left.getTimeSlot().getLabel());
                }
            }
        }
        return conflicts;
    }

    private TimetableEntryResponse toResponse(TimetableEntry entry) {
        return new TimetableEntryResponse(
                entry.getId(),
                entry.getCourse().getId(),
                entry.getCourse().getCode(),
                entry.getCourse().getTitle(),
                entry.getCourse().getStudentGroup(),
                entry.getCourse().getDepartment(),
                entry.getCourse().getProgram(),
                entry.getCourse().getBatchName(),
                entry.getCourse().getSection(),
                entry.getFaculty().getId(),
                entry.getFaculty().getFullName(),
                entry.getRoom().getId(),
                entry.getRoom().getName(),
                entry.getTimeSlot().getId(),
                entry.getTimeSlot().getDayOfWeek(),
                entry.getTimeSlot().getStartTime(),
                entry.getTimeSlot().getEndTime(),
                entry.getStatus(),
                entry.getSource());
    }
}
