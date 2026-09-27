package com.inmms.service;

import com.inmms.dto.AnalysisDTOs.*;
import com.inmms.entity.Alert;
import com.inmms.entity.Device;
import com.inmms.entity.Metric;
import com.inmms.repository.AlertRepository;
import com.inmms.repository.DeviceRepository;
import com.inmms.repository.MetricRepository;
import com.inmms.service.bayesian.BayesianNetworkService;
import com.inmms.service.xai.ExplainabilityService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class IncidentAnalysisService {

    private final AlertRepository alertRepository;
    private final DeviceRepository deviceRepository;
    private final MetricRepository metricRepository;
    private final ExplainabilityService explainabilityService;
    private final BayesianNetworkService bayesianNetworkService;

    public IncidentAnalysisService(AlertRepository alertRepository,
                                   DeviceRepository deviceRepository,
                                   MetricRepository metricRepository,
                                   ExplainabilityService explainabilityService,
                                   BayesianNetworkService bayesianNetworkService) {
        this.alertRepository = alertRepository;
        this.deviceRepository = deviceRepository;
        this.metricRepository = metricRepository;
        this.explainabilityService = explainabilityService;
        this.bayesianNetworkService = bayesianNetworkService;
    }

    public IncidentAnalysisResponse analyzeAlert(Long alertId) {
        Optional<Alert> alertOpt = alertRepository.findById(alertId);
        if (alertOpt.isEmpty()) {
            return null;
        }

        Alert alert = alertOpt.get();
        Device device = deviceRepository.findById(alert.getDeviceId()).orElse(null);
        Optional<Metric> metricOpt = metricRepository.findFirstByDeviceIdOrderByTimestampDesc(alert.getDeviceId());

        return buildAnalysis(alert, device, metricOpt.orElse(null), null);
    }

    public IncidentAnalysisResponse analyzeDevice(Long deviceId) {
        Device device = deviceRepository.findById(deviceId).orElse(null);
        if (device == null) {
            return null;
        }

        Optional<Metric> metricOpt = metricRepository.findFirstByDeviceIdOrderByTimestampDesc(deviceId);
        Optional<Alert> activeAlertOpt = alertRepository.findActiveAlertByDeviceAndType(deviceId, "HIGH_CPU");
        if (activeAlertOpt.isEmpty()) {
            List<Alert> deviceAlerts = alertRepository.findByDeviceIdOrderByCreatedAtDesc(deviceId);
            if (!deviceAlerts.isEmpty()) {
                activeAlertOpt = Optional.of(deviceAlerts.get(0));
            }
        }

        return buildAnalysis(activeAlertOpt.orElse(null), device, metricOpt.orElse(null), null);
    }

    public IncidentAnalysisResponse analyzeCustomMetrics(Map<String, Object> customInput) {
        String deviceName = customInput.containsKey("deviceName") ? (String) customInput.get("deviceName") : "Simulated-Router-01";
        String deviceType = customInput.containsKey("deviceType") ? (String) customInput.get("deviceType") : "Router";
        String ipAddress = customInput.containsKey("ipAddress") ? (String) customInput.get("ipAddress") : "192.168.1.1";

        double cpu = getDoubleValue(customInput, "cpu", 25.0);
        double memory = getDoubleValue(customInput, "memory", 40.0);
        double latency = getDoubleValue(customInput, "latency", 20.0);
        double packetLoss = getDoubleValue(customInput, "packetLoss", 0.0);
        double traffic = getDoubleValue(customInput, "traffic", 25.0);
        boolean reachable = customInput.containsKey("reachable") ? Boolean.parseBoolean(customInput.get("reachable").toString()) : true;

        Metric simulatedMetric = new Metric();
        simulatedMetric.setCpuUsage(cpu);
        simulatedMetric.setMemoryUsage(memory);
        simulatedMetric.setLatency(latency);
        simulatedMetric.setPacketLoss(packetLoss);
        simulatedMetric.setNetworkIn(traffic * 0.6);
        simulatedMetric.setNetworkOut(traffic * 0.4);
        simulatedMetric.setTimestamp(LocalDateTime.now());

        Device simulatedDevice = new Device();
        simulatedDevice.setId(999L);
        simulatedDevice.setName(deviceName);
        simulatedDevice.setDeviceType(deviceType);
        simulatedDevice.setIpAddress(ipAddress);
        simulatedDevice.setStatus(reachable ? (cpu > 90 || latency > 200 || packetLoss > 10 ? "CRITICAL" : (cpu > 80 || latency > 100 || packetLoss > 5 ? "WARNING" : "UP")) : "DOWN");

        Alert simulatedAlert = new Alert();
        simulatedAlert.setId(999L);
        simulatedAlert.setDeviceId(999L);
        simulatedAlert.setSeverity(simulatedDevice.getStatus().equals("CRITICAL") || !reachable ? "CRITICAL" : "WARNING");
        simulatedAlert.setAlertType(!reachable ? "DEVICE_DOWN" : (cpu > 80 ? "HIGH_CPU" : (latency > 100 ? "HIGH_LATENCY" : (packetLoss > 5 ? "PACKET_LOSS" : "TELEMETRY_ANOMALY"))));
        simulatedAlert.setStatus("OPEN");
        simulatedAlert.setCreatedAt(LocalDateTime.now());

        return buildAnalysis(simulatedAlert, simulatedDevice, simulatedMetric, reachable);
    }

    private IncidentAnalysisResponse buildAnalysis(Alert alert, Device device, Metric metric, Boolean explicitReachable) {
        IncidentAnalysisResponse resp = new IncidentAnalysisResponse();

        String devName = device != null ? device.getName() : (alert != null ? "Device #" + alert.getDeviceId() : "Network Node");
        String devIp = device != null ? device.getIpAddress() : "192.168.1.x";
        String devType = device != null ? device.getDeviceType() : "Network Device";

        resp.setAlertId(alert != null ? alert.getId() : null);
        resp.setAlertType(alert != null ? alert.getAlertType() : "INCIDENT_ANALYSIS");
        resp.setSeverity(alert != null ? alert.getSeverity() : "INFO");
        resp.setAlertStatus(alert != null ? alert.getStatus() : "ACTIVE");
        resp.setDeviceId(device != null ? device.getId() : (alert != null ? alert.getDeviceId() : null));
        resp.setDeviceName(devName);
        resp.setDeviceIp(devIp);
        resp.setDeviceType(devType);
        resp.setTimestamp(alert != null && alert.getCreatedAt() != null ? alert.getCreatedAt() : LocalDateTime.now());

        boolean isReachable = explicitReachable != null
                ? explicitReachable
                : (device == null || !"DOWN".equalsIgnoreCase(device.getStatus()));

        double cpu = metric != null && metric.getCpuUsage() != null ? metric.getCpuUsage() : 25.0;
        double memory = metric != null && metric.getMemoryUsage() != null ? metric.getMemoryUsage() : 40.0;
        double latency = metric != null && metric.getLatency() != null ? metric.getLatency() : 20.0;
        double packetLoss = metric != null && metric.getPacketLoss() != null ? metric.getPacketLoss() : 0.0;
        double netIn = metric != null && metric.getNetworkIn() != null ? metric.getNetworkIn() : 15.0;
        double netOut = metric != null && metric.getNetworkOut() != null ? metric.getNetworkOut() : 10.0;
        double traffic = Math.round((netIn + netOut) * 10.0) / 10.0;

        // If alert was DEVICE_DOWN, override reachability
        if (alert != null && "DEVICE_DOWN".equalsIgnoreCase(alert.getAlertType())) {
            isReachable = false;
            packetLoss = 100.0;
            traffic = 0.0;
        }

        Map<String, Object> observed = new LinkedHashMap<>();
        observed.put("cpuUsage", cpu);
        observed.put("memoryUsage", memory);
        observed.put("latency", latency);
        observed.put("packetLoss", packetLoss);
        observed.put("networkTraffic", traffic);
        observed.put("reachable", isReachable);
        resp.setObservedMetrics(observed);

        Map<String, Object> baselines = new LinkedHashMap<>();
        baselines.put("cpuUsage", ExplainabilityService.BASELINE_CPU);
        baselines.put("memoryUsage", ExplainabilityService.BASELINE_MEMORY);
        baselines.put("latency", ExplainabilityService.BASELINE_LATENCY);
        baselines.put("packetLoss", ExplainabilityService.BASELINE_PACKET_LOSS);
        baselines.put("networkTraffic", ExplainabilityService.BASELINE_TRAFFIC);
        resp.setBaselineMetrics(baselines);

        // 1. Run Explainable AI Module
        XaiExplanationDTO xai = explainabilityService.explain(devName, cpu, memory, latency, packetLoss, traffic, isReachable);
        resp.setXai(xai);

        // 2. Run Bayesian Network Root Cause Analysis Module
        BayesianRcaDTO bayesianRca = bayesianNetworkService.analyze(cpu, memory, latency, packetLoss, traffic, isReachable);
        resp.setBayesianRca(bayesianRca);

        // 3. Formulate Actionable Recommendation linked to Top Root Cause
        resp.setRecommendation(generateRecommendation(bayesianRca.getMostProbableCause(), devName, cpu, memory, latency, packetLoss, traffic, isReachable));

        return resp;
    }

    private RecommendationDTO generateRecommendation(String causeKey, String deviceName, double cpu, double memory,
                                                     double latency, double packetLoss, double traffic, boolean isReachable) {
        switch (causeKey) {
            case "NETWORK_CONGESTION":
                return new RecommendationDTO(
                        "Alleviate Network Traffic Congestion & Apply QoS",
                        String.format("Traffic on %s reached %.1f MB/s with latency of %.1f ms. Immediate traffic shaping or QoS rate limiting is recommended.", deviceName, traffic, latency),
                        "HIGH",
                        Arrays.asList(
                                "Inspect top bandwidth-consuming IP endpoints and protocol port distribution via NetFlow/sFlow.",
                                "Enable Quality of Service (QoS) prioritization for critical VoIP and mission-critical enterprise traffic.",
                                "Activate interface queue throttling or consider dynamic link aggregation (LACP) to distribute throughput."
                        )
                );

            case "LINK_FAILURE":
                return new RecommendationDTO(
                        "Investigate Physical Link & Port Error Counters",
                        String.format("Interface on %s experiences %.1f%% packet loss without corresponding high throughput. Indicates link-layer degradation.", deviceName, packetLoss),
                        "CRITICAL",
                        Arrays.asList(
                                "Inspect physical network cabling, fiber patch cords, and SFP transceiver optics for signal degradation.",
                                "Review switch port error counters (CRC errors, runts, frame alignment drops, and duplex mismatches).",
                                "Failover traffic to redundant secondary network path if degradation persists beyond 5 minutes."
                        )
                );

            case "HARDWARE_FAULT":
                return new RecommendationDTO(
                        "Inspect Hardware Resources & Process Utilization",
                        String.format("%s core resources are saturated (CPU: %.1f%%, Memory: %.1f%%). Indicates internal process deadlock or hardware constraint.", deviceName, cpu, memory),
                        "HIGH",
                        Arrays.asList(
                                "SSH into device and check top CPU/memory consuming process threads (top/htop/ps).",
                                "Inspect system kernel syslog for out-of-memory (OOM) alerts or hardware thermal throttling events.",
                                "Schedule service restart or allocate additional computing resources if workload permanently exceeds capacity."
                        )
                );

            case "CONFIG_ISSUE":
                return new RecommendationDTO(
                        "Review Routing Tables & Interface MTU Settings",
                        String.format("%s exhibits high latency (%.1f ms) and drop rates characteristic of sub-optimal routing hops or MTU mismatch.", deviceName, latency),
                        "HIGH",
                        Arrays.asList(
                                "Verify routing protocol convergence (BGP/OSPF neighbor states) and trace route hops for loops.",
                                "Validate interface MTU size matches upstream gateway to prevent packet fragmentation drops.",
                                "Compare recent configuration changes against verified operational baseline configuration backup."
                        )
                );

            case "DEVICE_FAILURE":
                return new RecommendationDTO(
                        "Urgent: Restore Device Power & Connectivity",
                        String.format("Device %s is completely non-responsive to network heartbeat and ping.", deviceName),
                        "CRITICAL",
                        Arrays.asList(
                                "Verify physical power supply unit (PSU) status, rack PDU indicators, and power cables.",
                                "Check remote management controller (iLO / iDRAC / console port) for hardware fault diagnostic codes.",
                                "Escalate to on-call NOC field technician for on-premise physical inspection if remote console fails."
                        )
                );

            case "TRANSIENT_SPIKE":
                return new RecommendationDTO(
                        "Monitor Transient Workload Surge",
                        String.format("Device %s experienced a surge in workload (CPU: %.1f%%, Traffic: %.1f MB/s) while network latency and error rates remain stable.", deviceName, cpu, traffic),
                        "MEDIUM",
                        Arrays.asList(
                                "Observe whether thread execution returns to nominal baseline within 1 to 2 monitoring cycles.",
                                "Verify cron jobs, scheduled database backups, or batch ETL processes executing during this window.",
                                "Ensure system autoscaling or task queue limits prevent thread pool saturation if load persists."
                        )
                );

            default:
                return new RecommendationDTO(
                        "Routine Monitoring & Baseline Observability",
                        String.format("Device %s metrics remain within certified operational limits. Continue standard automated telemetry polling.", deviceName),
                        "LOW",
                        Arrays.asList(
                                "Maintain continuous telemetry monitoring cycle.",
                                "No emergency operator action is required at this time."
                        )
                );
        }
    }

    private double getDoubleValue(Map<String, Object> map, String key, double defaultVal) {
        if (!map.containsKey(key) || map.get(key) == null) return defaultVal;
        try {
            return Double.parseDouble(map.get(key).toString());
        } catch (Exception e) {
            return defaultVal;
        }
    }
}
