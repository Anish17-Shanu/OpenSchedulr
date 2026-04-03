package com.openschedulr.scheduling.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.openschedulr.scheduling.dto.ScheduleGenerationResponse;
import com.openschedulr.timetable.repository.TimetableEntryRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "app.solver.enabled=false")
class SchedulingServiceHostedFallbackTest {

    @Autowired
    private SchedulingService schedulingService;

    @Autowired
    private TimetableEntryRepository timetableEntryRepository;

    @Test
    void shouldGenerateEntriesUsingHostedFallbackScheduler() {
        ScheduleGenerationResponse response = schedulingService.generateSchedule("admin@openschedulr.dev");

        assertThat(response.generatedEntries()).isGreaterThan(0);
        assertThat(timetableEntryRepository.count()).isEqualTo(response.generatedEntries());
        assertThat(response.warnings()).contains("Fast hosted scheduler was used.");
    }
}
