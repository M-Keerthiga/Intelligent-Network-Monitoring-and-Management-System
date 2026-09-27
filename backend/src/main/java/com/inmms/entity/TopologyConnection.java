package com.inmms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "topology_connections")
@Data
@NoArgsConstructor
@AllArgsConstructor
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
}
