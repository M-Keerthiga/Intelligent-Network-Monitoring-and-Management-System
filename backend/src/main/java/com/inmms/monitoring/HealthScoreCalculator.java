package com.inmms.monitoring;

import org.springframework.stereotype.Component;

@Component
public class HealthScoreCalculator {

    public static class HealthResult {
        private final int healthScore;
        private final String status;

        public HealthResult(int healthScore, String status) {
            this.healthScore = healthScore;
            this.status = status;
        }

        public int getHealthScore() {
            return healthScore;
        }

        public String getStatus() {
            return status;
        }
    }

    public HealthResult calculate(boolean isReachable, double cpuUsage, double memoryUsage, double latency, double packetLoss) {
        if (!isReachable) {
            return new HealthResult(0, "DOWN");
        }

        double availScore = 100.0;

        // CPU score: 0% = 100 score, 100% = 0 score
        double cpuScore = Math.max(0.0, Math.min(100.0, 100.0 - cpuUsage));

        // Memory score: 0% = 100 score, 100% = 0 score
        double memScore = Math.max(0.0, Math.min(100.0, 100.0 - memoryUsage));

        // Latency score: 0ms = 100 score, >=300ms = 0 score
        double latScore = Math.max(0.0, Math.min(100.0, 100.0 - (latency / 300.0 * 100.0)));

        // Packet loss score: 0% = 100 score, 100% = 0 score
        double lossScore = Math.max(0.0, Math.min(100.0, 100.0 - packetLoss));

        double rawHealth = (0.40 * availScore) + (0.20 * latScore) + (0.20 * lossScore) + (0.10 * cpuScore) + (0.10 * memScore);
        int finalHealthScore = (int) Math.round(Math.max(0.0, Math.min(100.0, rawHealth)));

        // Device Status Determination
        String status;
        if (cpuUsage > 95.0 || memoryUsage > 95.0 || latency > 200.0 || packetLoss > 10.0) {
            status = "CRITICAL";
        } else if (cpuUsage > 80.0 || memoryUsage > 80.0 || latency > 100.0 || packetLoss > 5.0) {
            status = "WARNING";
        } else {
            status = "UP";
        }

        return new HealthResult(finalHealthScore, status);
    }
}
