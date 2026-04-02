package com.openschedulr.faculty.model;

import com.openschedulr.auth.model.User;
import com.openschedulr.common.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "faculty")
public class Faculty extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private Integer maxLoad;

    @Column(nullable = false, columnDefinition = "jsonb")
    private String availability;

    @Column(nullable = false, columnDefinition = "jsonb")
    private String preferences;
}
