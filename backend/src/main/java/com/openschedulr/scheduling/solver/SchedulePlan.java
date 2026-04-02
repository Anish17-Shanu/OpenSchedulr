package com.openschedulr.scheduling.solver;

import com.openschedulr.timetable.model.Room;
import com.openschedulr.timetable.model.TimeSlot;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.optaplanner.core.api.domain.solution.PlanningEntityCollectionProperty;
import org.optaplanner.core.api.domain.solution.PlanningScore;
import org.optaplanner.core.api.domain.solution.PlanningSolution;
import org.optaplanner.core.api.domain.solution.ProblemFactCollectionProperty;
import org.optaplanner.core.api.domain.valuerange.ValueRangeProvider;
import org.optaplanner.core.api.score.buildin.hardsoft.HardSoftScore;

@Getter
@Setter
@NoArgsConstructor
@PlanningSolution
public class SchedulePlan {

    @ValueRangeProvider(id = "roomRange")
    @ProblemFactCollectionProperty
    private List<Room> rooms;

    @ValueRangeProvider(id = "timeSlotRange")
    @ProblemFactCollectionProperty
    private List<TimeSlot> timeSlots;

    @PlanningEntityCollectionProperty
    private List<LectureAssignment> lectures;

    @PlanningScore
    private HardSoftScore score;

    public SchedulePlan(List<Room> rooms, List<TimeSlot> timeSlots, List<LectureAssignment> lectures) {
        this.rooms = rooms;
        this.timeSlots = timeSlots;
        this.lectures = lectures;
    }
}
