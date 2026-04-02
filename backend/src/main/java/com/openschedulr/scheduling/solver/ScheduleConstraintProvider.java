package com.openschedulr.scheduling.solver;

import java.time.LocalTime;
import org.optaplanner.core.api.score.buildin.hardsoft.HardSoftScore;
import org.optaplanner.core.api.score.stream.Constraint;
import org.optaplanner.core.api.score.stream.ConstraintFactory;
import org.optaplanner.core.api.score.stream.ConstraintProvider;
import org.optaplanner.core.api.score.stream.ConstraintCollectors;
import org.optaplanner.core.api.score.stream.Joiners;

public class ScheduleConstraintProvider implements ConstraintProvider {

    @Override
    public Constraint[] defineConstraints(ConstraintFactory factory) {
        return new Constraint[]{
                facultyConflict(factory),
                roomConflict(factory),
                roomTypeMatch(factory),
                balancedWorkload(factory),
                preferredMorningSlots(factory)
        };
    }

    private Constraint facultyConflict(ConstraintFactory factory) {
        return factory.forEachUniquePair(LectureAssignment.class,
                        Joiners.equal(LectureAssignment::getFaculty),
                        Joiners.equal(LectureAssignment::getTimeSlot))
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Faculty overlap");
    }

    private Constraint roomConflict(ConstraintFactory factory) {
        return factory.forEachUniquePair(LectureAssignment.class,
                        Joiners.equal(LectureAssignment::getRoom),
                        Joiners.equal(LectureAssignment::getTimeSlot))
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Room overlap");
    }

    private Constraint roomTypeMatch(ConstraintFactory factory) {
        return factory.forEach(LectureAssignment.class)
                .filter(lecture -> lecture.getRoom() != null
                        && !lecture.getCourse().getRoomType().equalsIgnoreCase(lecture.getRoom().getRoomType()))
                .penalize(HardSoftScore.ONE_HARD)
                .asConstraint("Room type compatibility");
    }

    private Constraint balancedWorkload(ConstraintFactory factory) {
        return factory.forEach(LectureAssignment.class)
                .groupBy(LectureAssignment::getFaculty, ConstraintCollectors.count())
                .filter((faculty, count) -> count > faculty.getMaxLoad())
                .penalize(HardSoftScore.ONE_SOFT, (faculty, count) -> count - faculty.getMaxLoad())
                .asConstraint("Balanced workload");
    }

    private Constraint preferredMorningSlots(ConstraintFactory factory) {
        return factory.forEach(LectureAssignment.class)
                .filter(lecture -> lecture.getTimeSlot() != null
                        && lecture.getTimeSlot().getStartTime().isAfter(LocalTime.NOON))
                .penalize(HardSoftScore.ONE_SOFT)
                .asConstraint("Preferred morning slots");
    }
}
