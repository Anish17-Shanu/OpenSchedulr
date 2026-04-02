package com.openschedulr.scheduling.service;

import com.openschedulr.audit.service.AuditService;
import com.openschedulr.notification.service.NotificationService;
import com.openschedulr.scheduling.dto.ScheduleGenerationResponse;
import com.openschedulr.scheduling.model.LectureDemand;
import com.openschedulr.scheduling.repository.LectureDemandRepository;
import com.openschedulr.scheduling.solver.LectureAssignment;
import com.openschedulr.scheduling.solver.SchedulePlan;
import com.openschedulr.timetable.model.EntrySource;
import com.openschedulr.timetable.model.TimetableEntry;
import com.openschedulr.timetable.model.TimetableStatus;
import com.openschedulr.timetable.repository.RoomRepository;
import com.openschedulr.timetable.repository.TimeSlotRepository;
import com.openschedulr.timetable.repository.TimetableEntryRepository;
import lombok.RequiredArgsConstructor;
import org.optaplanner.core.api.solver.SolverFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SchedulingService {

    private final LectureDemandRepository lectureDemandRepository;
    private final RoomRepository roomRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final SolverFactory<SchedulePlan> solverFactory;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Transactional
    public ScheduleGenerationResponse generateSchedule(String actorEmail) {
        List<LectureDemand> demands = lectureDemandRepository.findAll();
        List<LectureAssignment> lectures = new ArrayList<>();
        for (LectureDemand demand : demands) {
            for (int i = 0; i < demand.getSessionsPerWeek(); i++) {
                lectures.add(new LectureAssignment(UUID.randomUUID(), demand.getCourse(), demand.getFaculty()));
            }
        }

        SchedulePlan problem = new SchedulePlan(roomRepository.findAll(), timeSlotRepository.findAll(), lectures);
        SchedulePlan solved = solverFactory.buildSolver().solve(problem);

        timetableEntryRepository.deleteAllInBatch();
        List<String> warnings = new ArrayList<>();
        List<TimetableEntry> entriesToSave = new ArrayList<>();
        for (LectureAssignment lecture : solved.getLectures()) {
            if (lecture.getRoom() == null || lecture.getTimeSlot() == null) {
                warnings.add("Unassigned session for " + lecture.getCourse().getCode());
                continue;
            }
            TimetableEntry entry = new TimetableEntry();
            entry.setCourse(lecture.getCourse());
            entry.setFaculty(lecture.getFaculty());
            entry.setRoom(lecture.getRoom());
            entry.setTimeSlot(lecture.getTimeSlot());
            entry.setStatus(TimetableStatus.DRAFT);
            entry.setSource(EntrySource.AUTO);
            entriesToSave.add(entry);
        }
        timetableEntryRepository.saveAll(entriesToSave);

        demands.forEach(demand -> notificationService.notifyUser(
                demand.getFaculty().getUser().getEmail(),
                "Schedule refreshed",
                "A new draft timetable is available for " + demand.getCourse().getCode()));
        auditService.log(actorEmail, "GENERATE_SCHEDULE", "Timetable", "draft", "Generated timetable using OptaPlanner");

        return new ScheduleGenerationResponse(entriesToSave.size(), warnings);
    }
}
