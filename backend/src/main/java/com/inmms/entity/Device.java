package com.inmms.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "devices")
public class Device {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "ip_address", nullable = false)
    private String ipAddress;

    @Column(name = "device_type", nullable = false)
    private String deviceType; // Router, Switch, Server, Firewall, Workstation, Access Point, Other

    private String location;

    private String description;

    @Column(name = "monitoring_enabled", nullable = false)
    private Boolean monitoringEnabled = true;

    @Column(nullable = false)
    private String status = "UP"; // UP, WARNING, CRITICAL, DOWN

    @Column(name = "health_score", nullable = false)
    private Integer healthScore = 100;

    @Column(name = "last_seen")
    private LocalDateTime lastSeen = LocalDateTime.now();

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Device() {}

    public Device(Long id, String name, String ipAddress, String deviceType, String location, String description,
                  Boolean monitoringEnabled, String status, Integer healthScore, LocalDateTime lastSeen, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.ipAddress = ipAddress;
        this.deviceType = deviceType;
        this.location = location;
        this.description = description;
        this.monitoringEnabled = monitoringEnabled != null ? monitoringEnabled : true;
        this.status = status != null ? status : "UP";
        this.healthScore = healthScore != null ? healthScore : 100;
        this.lastSeen = lastSeen != null ? lastSeen : LocalDateTime.now();
        this.createdAt = createdAt != null ? createdAt : LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public String getDeviceType() { return deviceType; }
    public void setDeviceType(String deviceType) { this.deviceType = deviceType; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getMonitoringEnabled() { return monitoringEnabled; }
    public void setMonitoringEnabled(Boolean monitoringEnabled) { this.monitoringEnabled = monitoringEnabled; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getHealthScore() { return healthScore; }
    public void setHealthScore(Integer healthScore) { this.healthScore = healthScore; }

    public LocalDateTime getLastSeen() { return lastSeen; }
    public void setLastSeen(LocalDateTime lastSeen) { this.lastSeen = lastSeen; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
