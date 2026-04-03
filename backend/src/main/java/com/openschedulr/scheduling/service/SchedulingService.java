package com.openschedulr.scheduling.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openschedulr.audit.service.AuditService;
import com.openschedulr.notification.service.NotificationService;
import com.openschedulr.scheduling.dto.ScheduleGenerationResponse;
import com.openschedulr.scheduling.model.LectureDemand;
import com.openschedulr.scheduling.repository.LectureDemandRepository;
import com.openschedulr.scheduling.solver.LectureAssignment;
import com.openschedulr.scheduling.solver.SchedulePlan;
import com.openschedulr.timetable.model.Room;
import com.openschedulr.timetable.model.TimeSlot;
import com.openschedulr.timetable.model.EntrySource;
import com.openschedulr.timetable.model.TimetableEntry;
import com.openschedulr.timetable.model.TimetableStatus;
import com.openschedulr.timetable.repository.RoomRepository;
import com.openschedulr.timetable.repository.TimeSlotRepository;
import com.openschedulr.timetable.repository.TimetableEntryRepository;
import java.time.DayOfWeek;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.optaplanner.core.api.solver.SolverFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
@RequiredArgsConstructor
public class SchedulingService {

    private final LectureDemandRepository lectureDemandRepository;
    private final RoomRepository roomRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final ObjectProvider<SolverFactory<SchedulePlan>> solverFactoryProvider;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final ObjectMapper objectMapper;
    @Value("${app.solver.enabled:true}")
    private boolean solverEnabled;

    private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {
    };

    @Transactional
    public ScheduleGenerationResponse generateSchedule(String actorEmail) {
        List<LectureDemand> demands = lectureDemandRepository.findAll();
        List<Room> rooms = roomRepository.findAll();
        List<TimeSlot> timeSlots = timeSlotRepository.findAll();
        List<String> warnings = new ArrayList<>();

        if (demands.isEmpty()) {
            warnings.add("No lecture demand is configured yet.");
            return new ScheduleGenerationResponse(0, warnings);
        }
        if (rooms.isEmpty()) {
            warnings.add("No rooms are configured yet.");
            return new ScheduleGenerationResponse(0, warnings);
        }
        if (timeSlots.isEmpty()) {
            warnings.add("No time slots are configured yet.");
            return new ScheduleGenerationResponse(0, warnings);
        }

        List<LectureAssignment> lectures = new ArrayList<>();
        for (LectureDemand demand : demands) {
            for (int i = 0; i < demand.getSessionsPerWeek(); i++) {
                lectures.add(new LectureAssignment(UUID.randomUUID(), demand.getCourse(), demand.getFaculty()));
            }
        }

        SchedulePlan problem = new SchedulePlan(rooms, timeSlots, lectures);
        SchedulePlan solved = solveWithFallback(problem, warnings);

        timetableEntryRepository.deleteAllInBatch();
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

    private SchedulePlan solveWithFallback(SchedulePlan problem, List<String> warnings) {
        if (!solverEnabled) {
            warnings.add("Fast hosted scheduler was used.");
            return buildFallbackSchedule(problem);
        }
        try {
            SolverFactory<SchedulePlan> solverFactory = solverFactoryProvider.getIfAvailable();
            if (solverFactory == null) {
                warnings.add("Primary solver is unavailable. A fast fallback scheduler was used.");
                return buildFallbackSchedule(problem);
            }
            return CompletableFuture
                    .supplyAsync(() -> solverFactory.buildSolver().solve(problem))
                    .orTimeout(12, TimeUnit.SECONDS)
                    .join();
        } catch (Exception exception) {
            log.warn("Primary OptaPlanner solve path did not complete cleanly. Falling back to heuristic scheduler.", exception);
            warnings.add("Primary solver timed out. A fast fallback scheduler was used.");
            return buildFallbackSchedule(problem);
        }
    }

    private SchedulePlan buildFallbackSchedule(SchedulePlan problem) {
        List<LectureAssignment> lectures = problem.getLectures().stream()
                .sorted(Comparator
                        .comparing((LectureAssignment lecture) -> lecture.getFaculty().getFullName())
                        .thenComparing(lecture -> lecture.getCourse().getCode())
                        .thenComparing(LectureAssignment::getId))
                .toList();
        List<TimeSlot> orderedSlots = problem.getTimeSlots().stream()
                .sorted(Comparator.comparing(TimeSlot::getDayOfWeek).thenComparing(TimeSlot::getStartTime))
                .toList();

        Map<UUID, Set<UUID>> facultyBusySlots = new HashMap<>();
        Map<UUID, Set<UUID>> roomBusySlots = new HashMap<>();
        Map<UUID, Integer> facultyLoad = new HashMap<>();

        for (LectureAssignment lecture : lectures) {
            RoomAssignment candidate = findPreferredAssignment(lecture, orderedSlots, problem.getRooms(), facultyBusySlots, roomBusySlots, facultyLoad);
            if (candidate == null) {
                candidate = findRelaxedAssignment(lecture, orderedSlots, problem.getRooms(), facultyBusySlots, roomBusySlots);
            }
            if (candidate == null) {
                continue;
            }
            lecture.setTimeSlot(candidate.timeSlot());
            lecture.setRoom(candidate.room());
            facultyBusySlots.computeIfAbsent(lecture.getFaculty().getId(), ignored -> new HashSet<>()).add(candidate.timeSlot().getId());
            roomBusySlots.computeIfAbsent(candidate.room().getId(), ignored -> new HashSet<>()).add(candidate.timeSlot().getId());
            facultyLoad.merge(lecture.getFaculty().getId(), 1, Integer::sum);
        }

        return new SchedulePlan(problem.getRooms(), problem.getTimeSlots(), new ArrayList<>(lectures));
    }

    private RoomAssignment findPreferredAssignment(
            LectureAssignment lecture,
            List<TimeSlot> orderedSlots,
            List<Room> rooms,
            Map<UUID, Set<UUID>> facultyBusySlots,
            Map<UUID, Set<UUID>> roomBusySlots,
            Map<UUID, Integer> facultyLoad
    ) {
        for (TimeSlot slot : orderedSlots) {
            if (!isFacultyAvailable(lecture, slot)) {
                continue;
            }
            if (facultyBusySlots.getOrDefault(lecture.getFaculty().getId(), Set.of()).contains(slot.getId())) {
                continue;
            }
            if (facultyLoad.getOrDefault(lecture.getFaculty().getId(), 0) >= lecture.getFaculty().getMaxLoad()) {
                continue;
            }
            Room room = findCompatibleRoom(lecture, slot, rooms, roomBusySlots);
            if (room != null) {
                return new RoomAssignment(room, slot);
            }
        }
        return null;
    }

    private RoomAssignment findRelaxedAssignment(
            LectureAssignment lecture,
            List<TimeSlot> orderedSlots,
            List<Room> rooms,
            Map<UUID, Set<UUID>> facultyBusySlots,
            Map<UUID, Set<UUID>> roomBusySlots
    ) {
        for (TimeSlot slot : orderedSlots) {
            if (facultyBusySlots.getOrDefault(lecture.getFaculty().getId(), Set.of()).contains(slot.getId())) {
                continue;
            }
            Room room = findCompatibleRoom(lecture, slot, rooms, roomBusySlots);
            if (room != null) {
                return new RoomAssignment(room, slot);
            }
        }
        return null;
    }

    private Room findCompatibleRoom(LectureAssignment lecture, TimeSlot slot, List<Room> rooms, Map<UUID, Set<UUID>> roomBusySlots) {
        return rooms.stream()
                .filter(room -> room.getRoomType().equalsIgnoreCase(lecture.getCourse().getRoomType()))
                .filter(room -> !roomBusySlots.getOrDefault(room.getId(), Set.of()).contains(slot.getId()))
                .findFirst()
                .orElse(null);
    }

    private boolean isFacultyAvailable(LectureAssignment lecture, TimeSlot slot) {
        try {
            List<String> availability = objectMapper.readValue(lecture.getFaculty().getAvailability(), STRING_LIST);
            if (availability.isEmpty()) {
                return true;
            }
            String slotKey = toSlotKey(slot.getDayOfWeek(), slot.getStartTime().toString());
            return availability.contains(slotKey);
        } catch (Exception exception) {
            log.debug("Could not parse faculty availability for {}", lecture.getFaculty().getFullName(), exception);
            return true;
        }
    }

    private String toSlotKey(DayOfWeek dayOfWeek, String startTime) {
        return dayOfWeek + "-" + startTime.substring(0, 5);
    }

    private record RoomAssignment(Room room, TimeSlot timeSlot) {
    }
}
