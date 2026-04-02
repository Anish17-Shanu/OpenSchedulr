package com.openschedulr.scheduling.config;

import com.openschedulr.scheduling.solver.SchedulePlan;
import org.optaplanner.core.api.solver.SolverFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OptaPlannerConfig {

    @Bean
    public SolverFactory<SchedulePlan> solverFactory() {
        return SolverFactory.createFromXmlResource("solverConfig.xml");
    }
}
