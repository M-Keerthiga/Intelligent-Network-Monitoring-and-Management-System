package com.inmms.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class DemoScenarioService {

    private static final Logger logger = LoggerFactory.getLogger(DemoScenarioService.class);

    private String activeScenario = "NORMAL";
    private Long targetDeviceId = null;

    public String getActiveScenario() {
        return activeScenario;
    }

    public Long getTargetDeviceId() {
        return targetDeviceId;
    }

    public void setScenario(String scenario, Long deviceId) {
        if (scenario == null || scenario.trim().isEmpty()) {
            this.activeScenario = "NORMAL";
        } else {
            this.activeScenario = scenario.toUpperCase();
        }
        this.targetDeviceId = deviceId;
        logger.info("Demo scenario switched to: {} (Target Device ID: {})", this.activeScenario, this.targetDeviceId);
    }
}
