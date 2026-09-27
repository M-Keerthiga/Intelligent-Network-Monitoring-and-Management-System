package com.inmms.service.xai;

import com.inmms.dto.AnalysisDTOs.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ExplainabilityService {

    // Standard NOC Operational Baselines for healthy enterprise devices
    public static final double BASELINE_CPU = 25.0; // %
    public static final double BASELINE_MEMORY = 40.0; // %
    public static final double BASELINE_LATENCY = 20.0; // ms
    public static final double BASELINE_PACKET_LOSS = 0.0; // %
    public static final double BASELINE_TRAFFIC = 25.0; // MB/s

    // Critical NOC Warning Thresholds
    public static final double THRESHOLD_CPU = 80.0;
    public static final double THRESHOLD_MEMORY = 80.0;
    public static final double THRESHOLD_LATENCY = 100.0;
    public static final double THRESHOLD_PACKET_LOSS = 5.0;
    public static final double THRESHOLD_TRAFFIC = 80.0;

    public XaiExplanationDTO explain(String deviceName, double cpu, double memory, double latency,
                                     double packetLoss, double traffic, boolean reachable) {
        XaiExplanationDTO xai = new XaiExplanationDTO();
        xai.setMethodology("Transparent Rule-Based Metric Baseline Deviation Analysis (Explainable AI)");
        xai.setScoreLabel("Composite Anomaly Severity Score");

        List<String> bulletPoints = new ArrayList<>();
        List<ContributingFactorDTO> factors = new ArrayList<>();

        // If device is down / unreachable
        if (!reachable) {
            xai.setAnomalyScore(1.0);
            xai.setExplanationStrength("Very High (Device Offline)");
            xai.setMainExplanation(String.format(
                    "%s was flagged with CRITICAL severity because the device is completely unreachable. Zero response was received on ICMP ping and telemetry heartbeat.",
                    deviceName));
            bulletPoints.add(String.format("%s failed consecutive network reachability health checks.", deviceName));
            bulletPoints.add("Effective packet loss is 100.0%, indicating complete loss of link or device power down.");
            bulletPoints.add("Network throughput dropped to 0.0 MB/s due to link unresponsiveness.");
            xai.setConclusion(String.format(
                    "Conclusion: Device %s is entirely non-operational, causing an immediate critical availability failure across monitored topology links.",
                    deviceName));

            factors.add(new ContributingFactorDTO("Device Reachability", "reachability", 0.0, 1.0, "State", 100.0, 60.0, "Very High", 1));
            factors.add(new ContributingFactorDTO("Packet Loss", "packetLoss", 100.0, 0.0, "%", 100.0, 40.0, "Very High", 2));
            xai.setEvidenceBulletPoints(bulletPoints);
            xai.setContributingFactors(factors);
            return xai;
        }

        // Calculate raw deviation deltas over baseline
        double devCpu = Math.max(0.0, cpu - BASELINE_CPU);
        double devMem = Math.max(0.0, memory - BASELINE_MEMORY);
        double devLat = Math.max(0.0, latency - BASELINE_LATENCY);
        double devLoss = Math.max(0.0, packetLoss - BASELINE_PACKET_LOSS);
        double devTraffic = Math.max(0.0, traffic - BASELINE_TRAFFIC);

        // Normalize deviations by operational span (threshold - baseline)
        double normCpu = devCpu / (THRESHOLD_CPU - BASELINE_CPU);
        double normMem = devMem / (THRESHOLD_MEMORY - BASELINE_MEMORY);
        double normLat = devLat / (THRESHOLD_LATENCY - BASELINE_LATENCY);
        double normLoss = devLoss / (THRESHOLD_PACKET_LOSS - BASELINE_PACKET_LOSS);
        double normTraffic = devTraffic / (THRESHOLD_TRAFFIC - BASELINE_TRAFFIC);

        double totalNormalized = normCpu + normMem + normLat + normLoss + normTraffic;
        if (totalNormalized < 0.001) totalNormalized = 0.001; // Avoid division by zero

        // Build contributing factor list
        factors.add(createFactor("CPU Utilization", "cpu", cpu, BASELINE_CPU, "%", normCpu, totalNormalized));
        factors.add(createFactor("Memory Utilization", "memory", memory, BASELINE_MEMORY, "%", normMem, totalNormalized));
        factors.add(createFactor("Network Latency", "latency", latency, BASELINE_LATENCY, "ms", normLat, totalNormalized));
        factors.add(createFactor("Packet Loss", "packetLoss", packetLoss, BASELINE_PACKET_LOSS, "%", normLoss, totalNormalized));
        factors.add(createFactor("Network Throughput", "traffic", traffic, BASELINE_TRAFFIC, "MB/s", normTraffic, totalNormalized));

        // Sort factors by contribution percentage descending
        factors.sort((a, b) -> Double.compare(b.getContributionPercent(), a.getContributionPercent()));
        for (int i = 0; i < factors.size(); i++) {
            factors.get(i).setRank(i + 1);
        }

        // Determine Anomaly Score: blend peak metric severity with aggregate deviation
        double peakDeviation = Math.min(1.0, Math.max(normCpu, Math.max(normMem, Math.max(normLat, Math.max(normLoss, normTraffic)))));
        double weightedDeviation = Math.min(1.0, (normCpu * 0.30) + (normMem * 0.15) + (normLat * 0.25) + (normLoss * 0.20) + (normTraffic * 0.10));
        double rawScore = Math.min(1.0, (peakDeviation * 0.60) + (weightedDeviation * 0.40));
        double anomalyScore = Math.round(rawScore * 100.0) / 100.0;
        xai.setAnomalyScore(anomalyScore);

        if (anomalyScore >= 0.80) {
            xai.setExplanationStrength("Very High (Severe multi-metric divergence)");
        } else if (anomalyScore >= 0.50) {
            xai.setExplanationStrength("High (Significant threshold breach)");
        } else if (anomalyScore >= 0.25) {
            xai.setExplanationStrength("Moderate (Elevated baseline activity)");
        } else {
            xai.setExplanationStrength("Low (Within normal operational bounds)");
        }

        // Dynamic Evidence bullet points
        if (cpu > 60.0) {
            bulletPoints.add(String.format("✓ CPU utilization is %.1f%%, significantly exceeding normal baseline range (%.1f%%).", cpu, BASELINE_CPU));
        }
        if (memory > 65.0) {
            bulletPoints.add(String.format("✓ Memory utilization is %.1f%%, reflecting high memory allocation over baseline (%.1f%%).", memory, BASELINE_MEMORY));
        }
        if (latency > 50.0) {
            bulletPoints.add(String.format("✓ Latency is %.1f ms, indicating degraded round-trip response and buffer queue delays.", latency));
        }
        if (packetLoss > 1.0) {
            bulletPoints.add(String.format("✓ Packet loss is %.1f%%, indicating dropped packets and transmission errors on the network path.", packetLoss));
        }
        if (traffic > 60.0) {
            bulletPoints.add(String.format("✓ Network traffic is %.1f MB/s, reflecting unusually heavy bandwidth demand.", traffic));
        }

        if (bulletPoints.isEmpty()) {
            bulletPoints.add("All monitored telemetry metrics remain within acceptable operational tolerances.");
        }

        // Build main explanation text
        List<String> keyDivergent = new ArrayList<>();
        for (ContributingFactorDTO f : factors) {
            if (f.getContributionPercent() >= 15.0) {
                keyDivergent.add(f.getMetricName().toLowerCase());
            }
        }

        String divergentMetricsStr = keyDivergent.isEmpty() ? "operational parameters" : String.join(", ", keyDivergent);
        xai.setMainExplanation(String.format(
                "%s was flagged because its %s significantly exceed normal operating thresholds.",
                deviceName, divergentMetricsStr));

        xai.setConclusion(String.format(
                "Conclusion: Multiple network telemetry indicators deviate from baseline operating state (Composite Score: %.2f), leading the system to classify %s as anomalous.",
                anomalyScore, deviceName));

        xai.setEvidenceBulletPoints(bulletPoints);
        xai.setContributingFactors(factors);

        return xai;
    }

    private ContributingFactorDTO createFactor(String name, String key, double value, double baseline,
                                               String unit, double normDev, double totalNormDev) {
        double contributionPct = Math.round((normDev / totalNormDev) * 100.0 * 10.0) / 10.0;
        double devPct = baseline > 0 ? Math.round(((value - baseline) / baseline) * 100.0 * 10.0) / 10.0 : Math.round(value * 10.0) / 10.0;

        String level;
        if (contributionPct >= 30.0) level = "Very High";
        else if (contributionPct >= 18.0) level = "High";
        else if (contributionPct >= 8.0) level = "Medium";
        else level = "Low";

        return new ContributingFactorDTO(name, key, Math.round(value * 10.0) / 10.0,
                baseline, unit, devPct, contributionPct, level, 0);
    }
}
