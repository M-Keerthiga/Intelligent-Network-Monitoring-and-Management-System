package com.inmms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {
    private long totalDevices;
    private long onlineDevices;
    private long warningDevices;
    private long criticalDevices;
    private long offlineDevices;
    private long criticalAlerts;
    private long warningAlerts;
    private double averageLatency;
    private double averagePacketLoss;
    private int networkHealthScore;
    private Map<String, Long> statusDistribution;
    private String activeScenario;
}
