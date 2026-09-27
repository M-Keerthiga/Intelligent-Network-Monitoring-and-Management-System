package com.inmms.monitoring;

import com.inmms.entity.Alert;
import com.inmms.entity.Device;
import com.inmms.entity.Metric;
import com.inmms.repository.AlertRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AnomalyDetectionService {

    private static final Logger logger = LoggerFactory.getLogger(AnomalyDetectionService.class);

    private final AlertRepository alertRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${inmms.ml-service.url:http://localhost:5000/predict}")
    private String mlServiceUrl;

    @Value("${inmms.ml-service.enabled:true}")
    private boolean mlEnabled;

    public AnomalyDetectionService(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    public void evaluate(Device device, Metric metric, boolean isReachable) {
        // 1. DEVICE_DOWN Check
        if (!isReachable) {
            handleRuleAlert(device, "DEVICE_DOWN", "CRITICAL", 0.0, 0.0,
                    String.format("%s is unreachable. The device failed the latest connectivity check.", device.getName()),
                    "Verify device power, connectivity cables, IP configuration, and network routing.");
            return;
        } else {
            resolveAlertIfActive(device.getId(), "DEVICE_DOWN");
        }

        // 2. HIGH_CPU Check
        double cpu = metric.getCpuUsage() != null ? metric.getCpuUsage() : 0.0;
        if (cpu > 80.0) {
            String severity = cpu > 95.0 ? "CRITICAL" : "WARNING";
            handleRuleAlert(device, "HIGH_CPU", severity, cpu, 80.0,
                    String.format("High CPU utilization detected on %s. CPU usage reached %.1f%%, exceeding warning threshold of 80%%.", device.getName(), cpu),
                    "Check active processes, application workload, and top CPU consuming threads.");
        } else {
            resolveAlertIfActive(device.getId(), "HIGH_CPU");
        }

        // 3. HIGH_MEMORY Check
        double mem = metric.getMemoryUsage() != null ? metric.getMemoryUsage() : 0.0;
        if (mem > 80.0) {
            String severity = mem > 95.0 ? "CRITICAL" : "WARNING";
            handleRuleAlert(device, "HIGH_MEMORY", severity, mem, 80.0,
                    String.format("High memory utilization detected on %s. Memory usage reached %.1f%%, exceeding warning threshold of 80%%.", device.getName(), mem),
                    "Check memory-consuming applications, Java heap usage, or restart affected services if appropriate.");
        } else {
            resolveAlertIfActive(device.getId(), "HIGH_MEMORY");
        }

        // 4. HIGH_LATENCY Check
        double lat = metric.getLatency() != null ? metric.getLatency() : 0.0;
        if (lat > 100.0) {
            String severity = lat > 200.0 ? "CRITICAL" : "WARNING";
            handleRuleAlert(device, "HIGH_LATENCY", severity, lat, 100.0,
                    String.format("High network latency detected on %s. Current latency is %.1f ms, exceeding acceptable threshold.", device.getName(), lat),
                    "Check network congestion, routing path, intermediate switches, and bandwidth saturation.");
        } else {
            resolveAlertIfActive(device.getId(), "HIGH_LATENCY");
        }

        // 5. PACKET_LOSS Check
        double loss = metric.getPacketLoss() != null ? metric.getPacketLoss() : 0.0;
        if (loss > 5.0) {
            String severity = loss > 10.0 ? "CRITICAL" : "WARNING";
            handleRuleAlert(device, "PACKET_LOSS", severity, loss, 5.0,
                    String.format("Network packet loss detected on %s. Packet loss reached %.1f%%, impacting connection reliability.", device.getName(), loss),
                    "Check physical network cables, port error statistics, wireless signal quality, and switch interface speed.");
        } else {
            resolveAlertIfActive(device.getId(), "PACKET_LOSS");
        }

        // 6. Optional Python ML Anomaly Detection Call
        if (mlEnabled) {
            checkMlAnomaly(device, metric);
        }
    }

    private void handleRuleAlert(Device device, String alertType, String severity, double metricValue, double threshold, String message, String recommendation) {
        Optional<Alert> existingOpt = alertRepository.findActiveAlertByDeviceAndType(device.getId(), alertType);
        if (existingOpt.isPresent()) {
            Alert existing = existingOpt.get();
            // Escalate severity or update metrics if needed
            existing.setMetricValue(metricValue);
            existing.setSeverity(severity);
            existing.setMessage(message);
            alertRepository.save(existing);
        } else {
            Alert alert = new Alert();
            alert.setDeviceId(device.getId());
            alert.setAlertType(alertType);
            alert.setSeverity(severity);
            alert.setMetricValue(metricValue);
            alert.setThreshold(threshold);
            alert.setMessage(message);
            alert.setRecommendedAction(recommendation);
            alert.setStatus("OPEN");
            alert.setCreatedAt(LocalDateTime.now());
            alertRepository.save(alert);
            logger.info("New Alert generated for device {}: {} ({})", device.getName(), alertType, severity);
        }
    }

    private void resolveAlertIfActive(Long deviceId, String alertType) {
        Optional<Alert> existingOpt = alertRepository.findActiveAlertByDeviceAndType(deviceId, alertType);
        if (existingOpt.isPresent()) {
            Alert existing = existingOpt.get();
            existing.setStatus("RESOLVED");
            existing.setResolvedAt(LocalDateTime.now());
            alertRepository.save(existing);
            logger.info("Alert auto-resolved for device ID {} type {}", deviceId, alertType);
        }
    }

    private void checkMlAnomaly(Device device, Metric metric) {
        try {
            Map<String, Object> req = new HashMap<>();
            req.put("cpu", metric.getCpuUsage());
            req.put("memory", metric.getMemoryUsage());
            req.put("latency", metric.getLatency());
            req.put("packet_loss", metric.getPacketLoss());
            req.put("traffic", (metric.getNetworkIn() != null ? metric.getNetworkIn() : 0.0) + (metric.getNetworkOut() != null ? metric.getNetworkOut() : 0.0));

            ResponseEntity<Map> resp = restTemplate.postForEntity(mlServiceUrl, req, Map.class);
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                Map body = resp.getBody();
                Boolean isAnomaly = (Boolean) body.get("is_anomaly");
                if (Boolean.TRUE.equals(isAnomaly)) {
                    handleRuleAlert(device, "ANOMALY_DETECTED", "WARNING", 1.0, 0.5,
                            String.format("Multivariate statistical anomaly detected on %s by ML Isolation Forest model.", device.getName()),
                            "Investigate unexpected metric combinations. Check traffic spikes coinciding with latency or CPU patterns.");
                } else {
                    resolveAlertIfActive(device.getId(), "ANOMALY_DETECTED");
                }
            }
        } catch (Exception e) {
            // Graceful fallback when Python ML service is offline
            logger.debug("Python ML service unreachable on {}: {}", mlServiceUrl, e.getMessage());
        }
    }
}
