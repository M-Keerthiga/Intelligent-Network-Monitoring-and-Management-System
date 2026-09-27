package com.inmms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
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
}
