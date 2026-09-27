package com.inmms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DemoScenarioRequest {
    private String scenario; // NORMAL, HIGH_CPU, HIGH_MEMORY, HIGH_LATENCY, PACKET_LOSS, DEVICE_DOWN, TRAFFIC_SPIKE, DEGRADED
    private Long deviceId;
}
