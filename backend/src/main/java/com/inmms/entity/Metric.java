package com.inmms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "metrics")
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

    public Metric() {}

    public Metric(Long id, Long deviceId, Double cpuUsage, Double memoryUsage, Double latency,
                  Double packetLoss, Double networkIn, Double networkOut, LocalDateTime timestamp) {
        this.id = id;
        this.deviceId = deviceId;
        this.cpuUsage = cpuUsage;
        this.memoryUsage = memoryUsage;
        this.latency = latency;
        this.packetLoss = packetLoss;
        this.networkIn = networkIn;
        this.networkOut = networkOut;
        this.timestamp = timestamp != null ? timestamp : LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDeviceId() { return deviceId; }
    public void setDeviceId(Long deviceId) { this.deviceId = deviceId; }

    public Double getCpuUsage() { return cpuUsage; }
    public void setCpuUsage(Double cpuUsage) { this.cpuUsage = cpuUsage; }

    public Double getMemoryUsage() { return memoryUsage; }
    public void setMemoryUsage(Double memoryUsage) { this.memoryUsage = memoryUsage; }

    public Double getLatency() { return latency; }
    public void setLatency(Double latency) { this.latency = latency; }

    public Double getPacketLoss() { return packetLoss; }
    public void setPacketLoss(Double packetLoss) { this.packetLoss = packetLoss; }

    public Double getNetworkIn() { return networkIn; }
    public void setNetworkIn(Double networkIn) { this.networkIn = networkIn; }

    public Double getNetworkOut() { return networkOut; }
    public void setNetworkOut(Double networkOut) { this.networkOut = networkOut; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
