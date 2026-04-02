package com.openschedulr.scheduling.solver;

import com.openschedulr.course.model.Course;
import com.openschedulr.faculty.model.Faculty;
import com.openschedulr.timetable.model.Room;
import com.openschedulr.timetable.model.TimeSlot;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.optaplanner.core.api.domain.entity.PlanningEntity;
import org.optaplanner.core.api.domain.lookup.PlanningId;
import org.optaplanner.core.api.domain.variable.PlanningVariable;

@Getter
@Setter
@NoArgsConstructor
@PlanningEntity
public class LectureAssignment {

    @PlanningId
    private UUID id;
    private Course course;
    private Faculty faculty;

    @PlanningVariable(valueRangeProviderRefs = "roomRange")
    private Room room;

    @PlanningVariable(valueRangeProviderRefs = "timeSlotRange")
    private TimeSlot timeSlot;

    public LectureAssignment(UUID id, Course course, Faculty faculty) {
        this.id = id;
        this.course = course;
        this.faculty = faculty;
    }
}
