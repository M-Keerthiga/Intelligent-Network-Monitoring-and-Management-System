package com.inmms.dto;

import java.util.Map;

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

    public DashboardSummaryResponse() {}

    public DashboardSummaryResponse(long totalDevices, long onlineDevices, long warningDevices, long criticalDevices,
                                    long offlineDevices, long criticalAlerts, long warningAlerts, double averageLatency,
                                    double averagePacketLoss, int networkHealthScore, Map<String, Long> statusDistribution,
                                    String activeScenario) {
        this.totalDevices = totalDevices;
        this.onlineDevices = onlineDevices;
        this.warningDevices = warningDevices;
        this.criticalDevices = criticalDevices;
        this.offlineDevices = offlineDevices;
        this.criticalAlerts = criticalAlerts;
        this.warningAlerts = warningAlerts;
        this.averageLatency = averageLatency;
        this.averagePacketLoss = averagePacketLoss;
        this.networkHealthScore = networkHealthScore;
        this.statusDistribution = statusDistribution;
        this.activeScenario = activeScenario;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
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

        public Builder totalDevices(long totalDevices) { this.totalDevices = totalDevices; return this; }
        public Builder onlineDevices(long onlineDevices) { this.onlineDevices = onlineDevices; return this; }
        public Builder warningDevices(long warningDevices) { this.warningDevices = warningDevices; return this; }
        public Builder criticalDevices(long criticalDevices) { this.criticalDevices = criticalDevices; return this; }
        public Builder offlineDevices(long offlineDevices) { this.offlineDevices = offlineDevices; return this; }
        public Builder criticalAlerts(long criticalAlerts) { this.criticalAlerts = criticalAlerts; return this; }
        public Builder warningAlerts(long warningAlerts) { this.warningAlerts = warningAlerts; return this; }
        public Builder averageLatency(double averageLatency) { this.averageLatency = averageLatency; return this; }
        public Builder averagePacketLoss(double averagePacketLoss) { this.averagePacketLoss = averagePacketLoss; return this; }
        public Builder networkHealthScore(int networkHealthScore) { this.networkHealthScore = networkHealthScore; return this; }
        public Builder statusDistribution(Map<String, Long> statusDistribution) { this.statusDistribution = statusDistribution; return this; }
        public Builder activeScenario(String activeScenario) { this.activeScenario = activeScenario; return this; }

        public DashboardSummaryResponse build() {
            return new DashboardSummaryResponse(totalDevices, onlineDevices, warningDevices, criticalDevices,
                    offlineDevices, criticalAlerts, warningAlerts, averageLatency, averagePacketLoss, networkHealthScore,
                    statusDistribution, activeScenario);
        }
    }

    public long getTotalDevices() { return totalDevices; }
    public void setTotalDevices(long totalDevices) { this.totalDevices = totalDevices; }

    public long getOnlineDevices() { return onlineDevices; }
    public void setOnlineDevices(long onlineDevices) { this.onlineDevices = onlineDevices; }

    public long getWarningDevices() { return warningDevices; }
    public void setWarningDevices(long warningDevices) { this.warningDevices = warningDevices; }

    public long getCriticalDevices() { return criticalDevices; }
    public void setCriticalDevices(long criticalDevices) { this.criticalDevices = criticalDevices; }

    public long getOfflineDevices() { return offlineDevices; }
    public void setOfflineDevices(long offlineDevices) { this.offlineDevices = offlineDevices; }

    public long getCriticalAlerts() { return criticalAlerts; }
    public void setCriticalAlerts(long criticalAlerts) { this.criticalAlerts = criticalAlerts; }

    public long getWarningAlerts() { return warningAlerts; }
    public void setWarningAlerts(long warningAlerts) { this.warningAlerts = warningAlerts; }

    public double getAverageLatency() { return averageLatency; }
    public void setAverageLatency(double averageLatency) { this.averageLatency = averageLatency; }

    public double getAveragePacketLoss() { return averagePacketLoss; }
    public void setAveragePacketLoss(double averagePacketLoss) { this.averagePacketLoss = averagePacketLoss; }

    public int getNetworkHealthScore() { return networkHealthScore; }
    public void setNetworkHealthScore(int networkHealthScore) { this.networkHealthScore = networkHealthScore; }

    public Map<String, Long> getStatusDistribution() { return statusDistribution; }
    public void setStatusDistribution(Map<String, Long> statusDistribution) { this.statusDistribution = statusDistribution; }

    public String getActiveScenario() { return activeScenario; }
    public void setActiveScenario(String activeScenario) { this.activeScenario = activeScenario; }
}
