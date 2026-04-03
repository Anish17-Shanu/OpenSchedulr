package com.openschedulr.common.seed;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openschedulr.auth.model.Role;
import com.openschedulr.auth.model.User;
import com.openschedulr.auth.repository.UserRepository;
import com.openschedulr.course.model.Course;
import com.openschedulr.course.repository.CourseRepository;
import com.openschedulr.faculty.model.Faculty;
import com.openschedulr.faculty.repository.FacultyRepository;
import com.openschedulr.scheduling.model.LectureDemand;
import com.openschedulr.scheduling.repository.LectureDemandRepository;
import com.openschedulr.timetable.model.Room;
import com.openschedulr.timetable.model.TimeSlot;
import com.openschedulr.timetable.repository.RoomRepository;
import com.openschedulr.timetable.repository.TimeSlotRepository;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Profile("!test")
@Order(10)
@Conditional(DataSeeder.SeedEnabledCondition.class)
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FacultyRepository facultyRepository;
    private final CourseRepository courseRepository;
    private final RoomRepository roomRepository;
    private final TimeSlotRepository timeSlotRepository;
    private final LectureDemandRepository lectureDemandRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        if (facultyRepository.count() > 0 || courseRepository.count() > 0 || roomRepository.count() > 0
                || timeSlotRepository.count() > 0 || lectureDemandRepository.count() > 0) {
            return;
        }

        createUser("admin@openschedulr.dev", "Admin@123", Role.ADMIN);
        User facultyUser1 = createUser("faculty1@openschedulr.dev", "Faculty@123", Role.FACULTY);
        User facultyUser2 = createUser("faculty2@openschedulr.dev", "Faculty@123", Role.FACULTY);
        User facultyUser3 = createUser("faculty3@openschedulr.dev", "Faculty@123", Role.FACULTY);
        User facultyUser4 = createUser("faculty4@openschedulr.dev", "Faculty@123", Role.FACULTY);

        Faculty faculty1 = createFaculty(facultyUser1, "Dr. Meera Nair", "Computer Science", 3,
                List.of("MONDAY-09:00", "TUESDAY-10:00", "WEDNESDAY-11:00"),
                Map.of("preferredWindow", "morning", "avoidDays", List.of("FRIDAY")));
        Faculty faculty2 = createFaculty(facultyUser2, "Prof. Arjun Rao", "Information Systems", 3,
                List.of("MONDAY-10:00", "THURSDAY-09:00", "FRIDAY-11:00"),
                Map.of("preferredWindow", "midday", "avoidDays", List.of("MONDAY")));
        Faculty faculty3 = createFaculty(facultyUser3, "Dr. Kavya Sen", "Computer Science", 4,
                List.of("MONDAY-11:00", "TUESDAY-09:00", "THURSDAY-10:00", "FRIDAY-09:00"),
                Map.of("preferredWindow", "afternoon", "avoidDays", List.of("WEDNESDAY")));
        Faculty faculty4 = createFaculty(facultyUser4, "Prof. Rohan Iyer", "Electronics", 4,
                List.of("MONDAY-12:00", "WEDNESDAY-10:00", "THURSDAY-11:00", "FRIDAY-10:00"),
                Map.of("preferredWindow", "morning", "avoidDays", List.of("TUESDAY")));

        Course distributedSystems = createCourse("CS501", "Distributed Systems", 4, 2, "BTECH-CSE-SEM5", "LAB");
        Course databaseSystems = createCourse("IS402", "Database Systems", 3, 2, "BTECH-IT-SEM4", "LECTURE");
        Course softwareEngineering = createCourse("CS404", "Software Engineering", 3, 3, "BTECH-CSE-SEM4", "LECTURE");
        Course operatingSystems = createCourse("CS302", "Operating Systems", 4, 2, "BTECH-CSE-SEM3", "LECTURE");
        Course digitalLogic = createCourse("EC201", "Digital Logic", 3, 2, "BTECH-ECE-SEM3", "LECTURE");
        Course embeddedLab = createCourse("EC350", "Embedded Systems Lab", 2, 2, "BTECH-ECE-SEM5", "LAB");

        createRoom("Lab-1", 60, "LAB");
        createRoom("Lab-2", 48, "LAB");
        createRoom("Room-204", 70, "LECTURE");
        createRoom("Room-301", 40, "LECTURE");
        createRoom("Room-410", 55, "LECTURE");

        createTimeSlot(DayOfWeek.MONDAY, "09:00", "10:00", "Mon 09:00-10:00");
        createTimeSlot(DayOfWeek.MONDAY, "10:00", "11:00", "Mon 10:00-11:00");
        createTimeSlot(DayOfWeek.MONDAY, "11:00", "12:00", "Mon 11:00-12:00");
        createTimeSlot(DayOfWeek.MONDAY, "12:00", "13:00", "Mon 12:00-13:00");
        createTimeSlot(DayOfWeek.TUESDAY, "09:00", "10:00", "Tue 09:00-10:00");
        createTimeSlot(DayOfWeek.TUESDAY, "10:00", "11:00", "Tue 10:00-11:00");
        createTimeSlot(DayOfWeek.WEDNESDAY, "10:00", "11:00", "Wed 10:00-11:00");
        createTimeSlot(DayOfWeek.WEDNESDAY, "11:00", "12:00", "Wed 11:00-12:00");
        createTimeSlot(DayOfWeek.THURSDAY, "09:00", "10:00", "Thu 09:00-10:00");
        createTimeSlot(DayOfWeek.THURSDAY, "10:00", "11:00", "Thu 10:00-11:00");
        createTimeSlot(DayOfWeek.THURSDAY, "11:00", "12:00", "Thu 11:00-12:00");
        createTimeSlot(DayOfWeek.FRIDAY, "09:00", "10:00", "Fri 09:00-10:00");
        createTimeSlot(DayOfWeek.FRIDAY, "10:00", "11:00", "Fri 10:00-11:00");
        createTimeSlot(DayOfWeek.FRIDAY, "11:00", "12:00", "Fri 11:00-12:00");

        createDemand(distributedSystems, faculty1, 2);
        createDemand(databaseSystems, faculty2, 2);
        createDemand(softwareEngineering, faculty3, 3);
        createDemand(operatingSystems, faculty1, 2);
        createDemand(digitalLogic, faculty4, 2);
        createDemand(embeddedLab, faculty4, 2);
    }

    private User createUser(String email, String password, Role role) {
        User user = userRepository.findByEmailIgnoreCase(email).orElseGet(User::new);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        return userRepository.save(user);
    }

    private Faculty createFaculty(User user, String fullName, String department, int maxLoad, List<String> availability, Map<String, Object> preferences)
            throws JsonProcessingException {
        Faculty faculty = new Faculty();
        faculty.setUser(user);
        faculty.setFullName(fullName);
        faculty.setDepartment(department);
        faculty.setMaxLoad(maxLoad);
        faculty.setAvailability(objectMapper.writeValueAsString(availability));
        faculty.setPreferences(objectMapper.writeValueAsString(preferences));
        faculty.setSubjects(objectMapper.writeValueAsString(switch (fullName) {
            case "Dr. Meera Nair" -> List.of("Distributed Systems", "Operating Systems");
            case "Prof. Arjun Rao" -> List.of("Database Systems");
            case "Dr. Kavya Sen" -> List.of("Software Engineering");
            default -> List.of("Digital Logic", "Embedded Systems Lab");
        }));
        return facultyRepository.save(faculty);
    }

    private Course createCourse(String code, String title, int credits, int requiredHours, String studentGroup, String roomType) {
        Course course = new Course();
        course.setCode(code);
        course.setTitle(title);
        course.setCredits(credits);
        course.setRequiredHours(requiredHours);
        course.setStudentGroup(studentGroup);
        course.setRoomType(roomType);
        course.setDepartment(studentGroup.contains("CSE") ? "Computer Science"
                : studentGroup.contains("IT") ? "Information Systems"
                : "Electronics");
        course.setProgram(studentGroup.contains("BTECH") ? "B.Tech" : "General");
        course.setBatchName(studentGroup.substring(studentGroup.lastIndexOf('-') + 1));
        course.setSection(studentGroup.contains("CSE") ? "A" : studentGroup.contains("IT") ? "B" : "C");
        return courseRepository.save(course);
    }

    private void createRoom(String name, int capacity, String roomType) {
        Room room = new Room();
        room.setName(name);
        room.setCapacity(capacity);
        room.setRoomType(roomType);
        roomRepository.save(room);
    }

    private void createTimeSlot(DayOfWeek dayOfWeek, String start, String end, String label) {
        TimeSlot timeSlot = new TimeSlot();
        timeSlot.setDayOfWeek(dayOfWeek);
        timeSlot.setStartTime(LocalTime.parse(start));
        timeSlot.setEndTime(LocalTime.parse(end));
        timeSlot.setLabel(label);
        timeSlotRepository.save(timeSlot);
    }

    private void createDemand(Course course, Faculty faculty, int sessionsPerWeek) {
        LectureDemand demand = new LectureDemand();
        demand.setCourse(course);
        demand.setFaculty(faculty);
        demand.setSessionsPerWeek(sessionsPerWeek);
        lectureDemandRepository.save(demand);
    }

    static class SeedEnabledCondition implements Condition {

        @Override
        public boolean matches(ConditionContext context, AnnotatedTypeMetadata metadata) {
            String demoEnabled = context.getEnvironment().getProperty("app.seed.demo-enabled", "true");
            String hostedScheduleEnabled = context.getEnvironment().getProperty("app.seed.hosted-schedule-enabled", "false");
            return Boolean.parseBoolean(demoEnabled) || Boolean.parseBoolean(hostedScheduleEnabled);
        }
    }
}
