package com.inmms.dto;

import java.util.List;

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

    public ReportSummaryResponse() {}

    public ReportSummaryResponse(long totalDevices, double availabilityPercentage, double averageLatency,
                                 double averagePacketLoss, long totalAlerts, long criticalAlerts, long warningAlerts,
                                 long resolvedAlerts, String highestCpuDevice, double highestCpuValue,
                                 String highestLatencyDevice, double highestLatencyValue,
                                 List<ProblematicDeviceDTO> problematicDevices) {
        this.totalDevices = totalDevices;
        this.availabilityPercentage = availabilityPercentage;
        this.averageLatency = averageLatency;
        this.averagePacketLoss = averagePacketLoss;
        this.totalAlerts = totalAlerts;
        this.criticalAlerts = criticalAlerts;
        this.warningAlerts = warningAlerts;
        this.resolvedAlerts = resolvedAlerts;
        this.highestCpuDevice = highestCpuDevice;
        this.highestCpuValue = highestCpuValue;
        this.highestLatencyDevice = highestLatencyDevice;
        this.highestLatencyValue = highestLatencyValue;
        this.problematicDevices = problematicDevices;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
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

        public Builder totalDevices(long totalDevices) { this.totalDevices = totalDevices; return this; }
        public Builder availabilityPercentage(double availabilityPercentage) { this.availabilityPercentage = availabilityPercentage; return this; }
        public Builder averageLatency(double averageLatency) { this.averageLatency = averageLatency; return this; }
        public Builder averagePacketLoss(double averagePacketLoss) { this.averagePacketLoss = averagePacketLoss; return this; }
        public Builder totalAlerts(long totalAlerts) { this.totalAlerts = totalAlerts; return this; }
        public Builder criticalAlerts(long criticalAlerts) { this.criticalAlerts = criticalAlerts; return this; }
        public Builder warningAlerts(long warningAlerts) { this.warningAlerts = warningAlerts; return this; }
        public Builder resolvedAlerts(long resolvedAlerts) { this.resolvedAlerts = resolvedAlerts; return this; }
        public Builder highestCpuDevice(String highestCpuDevice) { this.highestCpuDevice = highestCpuDevice; return this; }
        public Builder highestCpuValue(double highestCpuValue) { this.highestCpuValue = highestCpuValue; return this; }
        public Builder highestLatencyDevice(String highestLatencyDevice) { this.highestLatencyDevice = highestLatencyDevice; return this; }
        public Builder highestLatencyValue(double highestLatencyValue) { this.highestLatencyValue = highestLatencyValue; return this; }
        public Builder problematicDevices(List<ProblematicDeviceDTO> problematicDevices) { this.problematicDevices = problematicDevices; return this; }

        public ReportSummaryResponse build() {
            return new ReportSummaryResponse(totalDevices, availabilityPercentage, averageLatency, averagePacketLoss,
                    totalAlerts, criticalAlerts, warningAlerts, resolvedAlerts, highestCpuDevice, highestCpuValue,
                    highestLatencyDevice, highestLatencyValue, problematicDevices);
        }
    }

    public static class ProblematicDeviceDTO {
        private Long deviceId;
        private String name;
        private String ipAddress;
        private String deviceType;
        private String status;
        private Integer healthScore;
        private long alertCount;

        public ProblematicDeviceDTO() {}

        public ProblematicDeviceDTO(Long deviceId, String name, String ipAddress, String deviceType,
                                    String status, Integer healthScore, long alertCount) {
            this.deviceId = deviceId;
            this.name = name;
            this.ipAddress = ipAddress;
            this.deviceType = deviceType;
            this.status = status;
            this.healthScore = healthScore;
            this.alertCount = alertCount;
        }

        public Long getDeviceId() { return deviceId; }
        public void setDeviceId(Long deviceId) { this.deviceId = deviceId; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getIpAddress() { return ipAddress; }
        public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

        public String getDeviceType() { return deviceType; }
        public void setDeviceType(String deviceType) { this.deviceType = deviceType; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public Integer getHealthScore() { return healthScore; }
        public void setHealthScore(Integer healthScore) { this.healthScore = healthScore; }

        public long getAlertCount() { return alertCount; }
        public void setAlertCount(long alertCount) { this.alertCount = alertCount; }
    }

    public long getTotalDevices() { return totalDevices; }
    public void setTotalDevices(long totalDevices) { this.totalDevices = totalDevices; }

    public double getAvailabilityPercentage() { return availabilityPercentage; }
    public void setAvailabilityPercentage(double availabilityPercentage) { this.availabilityPercentage = availabilityPercentage; }

    public double getAverageLatency() { return averageLatency; }
    public void setAverageLatency(double averageLatency) { this.averageLatency = averageLatency; }

    public double getAveragePacketLoss() { return averagePacketLoss; }
    public void setAveragePacketLoss(double averagePacketLoss) { this.averagePacketLoss = averagePacketLoss; }

    public long getTotalAlerts() { return totalAlerts; }
    public void setTotalAlerts(long totalAlerts) { this.totalAlerts = totalAlerts; }

    public long getCriticalAlerts() { return criticalAlerts; }
    public void setCriticalAlerts(long criticalAlerts) { this.criticalAlerts = criticalAlerts; }

    public long getWarningAlerts() { return warningAlerts; }
    public void setWarningAlerts(long warningAlerts) { this.warningAlerts = warningAlerts; }

    public long getResolvedAlerts() { return resolvedAlerts; }
    public void setResolvedAlerts(long resolvedAlerts) { this.resolvedAlerts = resolvedAlerts; }

    public String getHighestCpuDevice() { return highestCpuDevice; }
    public void setHighestCpuDevice(String highestCpuDevice) { this.highestCpuDevice = highestCpuDevice; }

    public double getHighestCpuValue() { return highestCpuValue; }
    public void setHighestCpuValue(double highestCpuValue) { this.highestCpuValue = highestCpuValue; }

    public String getHighestLatencyDevice() { return highestLatencyDevice; }
    public void setHighestLatencyDevice(String highestLatencyDevice) { this.highestLatencyDevice = highestLatencyDevice; }

    public double getHighestLatencyValue() { return highestLatencyValue; }
    public void setHighestLatencyValue(double highestLatencyValue) { this.highestLatencyValue = highestLatencyValue; }

    public List<ProblematicDeviceDTO> getProblematicDevices() { return problematicDevices; }
    public void setProblematicDevices(List<ProblematicDeviceDTO> problematicDevices) { this.problematicDevices = problematicDevices; }
}
