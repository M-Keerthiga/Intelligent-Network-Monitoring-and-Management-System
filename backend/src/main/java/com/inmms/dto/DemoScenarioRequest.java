package com.inmms.dto;

public class DemoScenarioRequest {
    private String scenario; // NORMAL, HIGH_CPU, HIGH_MEMORY, HIGH_LATENCY, PACKET_LOSS, DEVICE_DOWN, TRAFFIC_SPIKE, DEGRADED
    private Long deviceId;

    public DemoScenarioRequest() {}

    public DemoScenarioRequest(String scenario, Long deviceId) {
        this.scenario = scenario;
        this.deviceId = deviceId;
    }

    public String getScenario() { return scenario; }
    public void setScenario(String scenario) { this.scenario = scenario; }

    public Long getDeviceId() { return deviceId; }
    public void setDeviceId(Long deviceId) { this.deviceId = deviceId; }
}
