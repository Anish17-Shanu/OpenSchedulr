package com.openschedulr.scheduling.config;

import com.openschedulr.scheduling.solver.SchedulePlan;
import org.optaplanner.core.api.solver.SolverFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(prefix = "app.solver", name = "enabled", havingValue = "true", matchIfMissing = true)
public class OptaPlannerConfig {

    @Bean
    public SolverFactory<SchedulePlan> solverFactory() {
        return SolverFactory.createFromXmlResource("solverConfig.xml");
    }
}
