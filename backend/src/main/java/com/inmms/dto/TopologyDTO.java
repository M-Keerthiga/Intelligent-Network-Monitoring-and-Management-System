package com.inmms.dto;

import com.inmms.entity.Device;
import com.inmms.entity.TopologyConnection;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopologyDTO {
    private List<DeviceNode> nodes;
    private List<TopologyConnection> connections;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeviceNode {
        private Long id;
        private String name;
        private String ipAddress;
        private String deviceType;
        private String status;
        private Integer healthScore;
    }
}
