package com.openschedulr.common.seed;

import com.openschedulr.scheduling.repository.LectureDemandRepository;
import com.openschedulr.scheduling.service.SchedulingService;
import com.openschedulr.timetable.model.TimetableStatus;
import com.openschedulr.timetable.repository.TimetableEntryRepository;
import com.openschedulr.timetable.service.TimetableService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@Profile("postgres & !test")
@ConditionalOnProperty(prefix = "app.seed", name = "hosted-schedule-enabled", havingValue = "true", matchIfMissing = true)
public class HostedScheduleBootstrapListener {

    private static final String SYSTEM_ACTOR = "system@openschedulr.dev";

    private final LectureDemandRepository lectureDemandRepository;
    private final TimetableEntryRepository timetableEntryRepository;
    private final SchedulingService schedulingService;
    private final TimetableService timetableService;

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        Thread bootstrapThread = new Thread(this::seedAndPublishIfNeeded, "hosted-schedule-bootstrap");
        bootstrapThread.setDaemon(true);
        bootstrapThread.start();
    }

    private void seedAndPublishIfNeeded() {
        try {
            if (lectureDemandRepository.count() == 0) {
                log.info("Hosted schedule bootstrap skipped because no lecture demand exists yet.");
                return;
            }

            if (timetableEntryRepository.count() == 0) {
                log.info("Generating hosted demo schedule after application startup.");
                schedulingService.generateSchedule(SYSTEM_ACTOR);
            }

            boolean hasPublishedEntries = timetableEntryRepository.findAll().stream()
                    .anyMatch(entry -> entry.getStatus() == TimetableStatus.PUBLISHED);
            if (!hasPublishedEntries) {
                log.info("Publishing hosted demo schedule after generation.");
                timetableService.publish(SYSTEM_ACTOR);
            }
        } catch (Exception exception) {
            log.error("Hosted schedule bootstrap failed after startup.", exception);
        }
    }
}
