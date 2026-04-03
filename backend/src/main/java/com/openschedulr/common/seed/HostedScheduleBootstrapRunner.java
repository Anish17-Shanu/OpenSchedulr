package com.openschedulr.common.seed;

import com.openschedulr.scheduling.repository.LectureDemandRepository;
import com.openschedulr.scheduling.service.SchedulingService;
import com.openschedulr.timetable.model.TimetableStatus;
import com.openschedulr.timetable.repository.TimetableEntryRepository;
import com.openschedulr.timetable.service.TimetableService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Profile("postgres & !test")
@Order(20)
@ConditionalOnProperty(prefix = "app.seed", name = "hosted-schedule-enabled", havingValue = "true", matchIfMissing = true)
public class HostedScheduleBootstrapRunner implements CommandLineRunner {

    private static final String SYSTEM_ACTOR = "system@openschedulr.dev";

    private final LectureDemandRepository lectureDemandRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final SchedulingService schedulingService;
    private final TimetableService timetableService;

    @Override
    public void run(String... args) {
        if (lectureDemandRepository.count() == 0) {
            return;
        }

        if (timetableEntryRepository.count() == 0) {
            schedulingService.generateSchedule(SYSTEM_ACTOR);
        }

        boolean hasPublishedEntries = timetableEntryRepository.findAll().stream()
                .anyMatch(entry -> entry.getStatus() == TimetableStatus.PUBLISHED);
        if (!hasPublishedEntries) {
            timetableService.publish(SYSTEM_ACTOR);
        }
    }
}
