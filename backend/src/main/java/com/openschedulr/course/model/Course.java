package com.openschedulr.course.model;

import com.openschedulr.common.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "courses")
public class Course extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private Integer credits;

    @Column(nullable = false)
    private Integer requiredHours;

    @Column(nullable = false)
    private String studentGroup;

    @Column(nullable = false)
    private String roomType;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String program;

    @Column(name = "batch_name", nullable = false)
    private String batchName;

    @Column(nullable = false)
    private String section;
}
