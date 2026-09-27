package com.inmms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportSummaryResponse {
    private long totalDevices;
    private double availabilityPercentage;
    private double averageLatency;
    private double averagePacketLoss;
    private long totalAlerts;
    private long criticalAlerts;
    private long warningAlerts;
    private long resolvedAlerts;
    private String highestCpuDevice;
    private double highestCpuValue;
    private String highestLatencyDevice;
    private double highestLatencyValue;
    private List<ProblematicDeviceDTO> problematicDevices;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProblematicDeviceDTO {
        private Long deviceId;
        private String name;
        private String ipAddress;
        private String deviceType;
        private String status;
        private Integer healthScore;
        private long alertCount;
    }
}
