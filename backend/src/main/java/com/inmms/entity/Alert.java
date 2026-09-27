package com.inmms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
public class Alert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", nullable = false)
    private Long deviceId;

    @Column(name = "alert_type", nullable = false)
    private String alertType; // HIGH_CPU, HIGH_MEMORY, HIGH_LATENCY, PACKET_LOSS, DEVICE_DOWN, TRAFFIC_SPIKE, ANOMALY_DETECTED

    @Column(nullable = false)
    private String severity; // INFO, WARNING, CRITICAL

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "metric_value")
    private Double metricValue;

    private Double threshold;

    @Column(name = "recommended_action", columnDefinition = "TEXT")
    private String recommendedAction;

    @Column(nullable = false)
    private String status = "OPEN"; // OPEN, ACKNOWLEDGED, RESOLVED

    @Column(name = "acknowledged_by")
    private String acknowledgedBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    public Alert() {}

    public Alert(Long id, Long deviceId, String alertType, String severity, String message, Double metricValue,
                 Double threshold, String recommendedAction, String status, String acknowledgedBy,
                 LocalDateTime createdAt, LocalDateTime acknowledgedAt, LocalDateTime resolvedAt) {
        this.id = id;
        this.deviceId = deviceId;
        this.alertType = alertType;
        this.severity = severity;
        this.message = message;
        this.metricValue = metricValue;
        this.threshold = threshold;
        this.recommendedAction = recommendedAction;
        this.status = status;
        this.acknowledgedBy = acknowledgedBy;
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
        this.acknowledgedAt = acknowledgedAt;
        this.resolvedAt = resolvedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDeviceId() { return deviceId; }
    public void setDeviceId(Long deviceId) { this.deviceId = deviceId; }

    public String getAlertType() { return alertType; }
    public void setAlertType(String alertType) { this.alertType = alertType; }

    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Double getMetricValue() { return metricValue; }
    public void setMetricValue(Double metricValue) { this.metricValue = metricValue; }

    public Double getThreshold() { return threshold; }
    public void setThreshold(Double threshold) { this.threshold = threshold; }

    public String getRecommendedAction() { return recommendedAction; }
    public void setRecommendedAction(String recommendedAction) { this.recommendedAction = recommendedAction; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAcknowledgedBy() { return acknowledgedBy; }
    public void setAcknowledgedBy(String acknowledgedBy) { this.acknowledgedBy = acknowledgedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getAcknowledgedAt() { return acknowledgedAt; }
    public void setAcknowledgedAt(LocalDateTime acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}
