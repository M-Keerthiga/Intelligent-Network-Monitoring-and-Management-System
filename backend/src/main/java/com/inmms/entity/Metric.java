package com.inmms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "metrics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Metric {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "device_id", nullable = false)
    private Long deviceId;

    @Column(name = "cpu_usage")
    private Double cpuUsage; // percentage (0-100)

    @Column(name = "memory_usage")
    private Double memoryUsage; // percentage (0-100)

    private Double latency; // milliseconds

    @Column(name = "packet_loss")
    private Double packetLoss; // percentage (0-100)

    @Column(name = "network_in")
    private Double networkIn; // MB/s or KB/s

    @Column(name = "network_out")
    private Double networkOut; // MB/s or KB/s

    @Column(nullable = false)
    private LocalDateTime timestamp = LocalDateTime.now();
}
