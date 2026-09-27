package com.inmms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "topology_connections")
public class TopologyConnection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source_device_id", nullable = false)
    private Long sourceDeviceId;

    @Column(name = "target_device_id", nullable = false)
    private Long targetDeviceId;

    @Column(name = "connection_type")
    private String connectionType = "Ethernet"; // Ethernet, Fiber, Wireless, Uplink

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public TopologyConnection() {}

    public TopologyConnection(Long id, Long sourceDeviceId, Long targetDeviceId, String connectionType, LocalDateTime createdAt) {
        this.id = id;
        this.sourceDeviceId = sourceDeviceId;
        this.targetDeviceId = targetDeviceId;
        this.connectionType = connectionType != null ? connectionType : "Ethernet";
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSourceDeviceId() { return sourceDeviceId; }
    public void setSourceDeviceId(Long sourceDeviceId) { this.sourceDeviceId = sourceDeviceId; }

    public Long getTargetDeviceId() { return targetDeviceId; }
    public void setTargetDeviceId(Long targetDeviceId) { this.targetDeviceId = targetDeviceId; }

    public String getConnectionType() { return connectionType; }
    public void setConnectionType(String connectionType) { this.connectionType = connectionType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
