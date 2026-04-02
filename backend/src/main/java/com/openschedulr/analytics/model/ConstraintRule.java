package com.openschedulr.analytics.model;

import com.openschedulr.common.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "constraints")
public class ConstraintRule extends BaseEntity {

    @Column(nullable = false)
    private String constraintType;

    @Column(nullable = false)
    private Integer weight;

    @Column(nullable = false)
    private Boolean enabled;

    @Column(nullable = false, columnDefinition = "jsonb")
    private String config;
}
