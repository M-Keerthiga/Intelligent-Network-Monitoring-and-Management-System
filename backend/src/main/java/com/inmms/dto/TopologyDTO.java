package com.inmms.dto;

import com.inmms.entity.TopologyConnection;
import java.util.List;

public class TopologyDTO {
    private List<DeviceNode> nodes;
    private List<TopologyConnection> connections;

    public TopologyDTO() {}

    public TopologyDTO(List<DeviceNode> nodes, List<TopologyConnection> connections) {
        this.nodes = nodes;
        this.connections = connections;
    }

    public List<DeviceNode> getNodes() { return nodes; }
    public void setNodes(List<DeviceNode> nodes) { this.nodes = nodes; }

    public List<TopologyConnection> getConnections() { return connections; }
    public void setConnections(List<TopologyConnection> connections) { this.connections = connections; }

    public static class DeviceNode {
        private Long id;
        private String name;
        private String ipAddress;
        private String deviceType;
        private String status;
        private Integer healthScore;

        public DeviceNode() {}

        public DeviceNode(Long id, String name, String ipAddress, String deviceType, String status, Integer healthScore) {
            this.id = id;
            this.name = name;
            this.ipAddress = ipAddress;
            this.deviceType = deviceType;
            this.status = status;
            this.healthScore = healthScore;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getIpAddress() { return ipAddress; }
        public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

        public String getDeviceType() { return deviceType; }
        public void setDeviceType(String deviceType) { this.deviceType = deviceType; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public Integer getHealthScore() { return healthScore; }
        public void setHealthScore(Integer healthScore) { this.healthScore = healthScore; }
    }
}
