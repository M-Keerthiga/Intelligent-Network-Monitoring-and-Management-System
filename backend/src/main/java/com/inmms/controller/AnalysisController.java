package com.inmms.controller;

import com.inmms.dto.AnalysisDTOs.IncidentAnalysisResponse;
import com.inmms.service.IncidentAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/analysis")
@CrossOrigin(originPatterns = "*")
public class AnalysisController {

    private final IncidentAnalysisService incidentAnalysisService;

    public AnalysisController(IncidentAnalysisService incidentAnalysisService) {
        this.incidentAnalysisService = incidentAnalysisService;
    }

    @GetMapping("/alert/{alertId}")
    public ResponseEntity<IncidentAnalysisResponse> getAlertAnalysis(@PathVariable Long alertId) {
        IncidentAnalysisResponse resp = incidentAnalysisService.analyzeAlert(alertId);
        if (resp == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/device/{deviceId}")
    public ResponseEntity<IncidentAnalysisResponse> getDeviceAnalysis(@PathVariable Long deviceId) {
        IncidentAnalysisResponse resp = incidentAnalysisService.analyzeDevice(deviceId);
        if (resp == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/evaluate")
    public ResponseEntity<IncidentAnalysisResponse> evaluateCustomMetrics(@RequestBody Map<String, Object> metricsInput) {
        IncidentAnalysisResponse resp = incidentAnalysisService.analyzeCustomMetrics(metricsInput);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/benchmarks")
    public ResponseEntity<Map<String, IncidentAnalysisResponse>> getBenchmarkScenarios() {
        Map<String, IncidentAnalysisResponse> benchmarks = new LinkedHashMap<>();

        // Scenario A: Normal
        Map<String, Object> normalInput = new HashMap<>();
        normalInput.put("deviceName", "Router-01 (Normal)");
        normalInput.put("cpu", 24.5);
        normalInput.put("memory", 42.0);
        normalInput.put("latency", 16.5);
        normalInput.put("packetLoss", 0.0);
        normalInput.put("traffic", 22.0);
        normalInput.put("reachable", true);
        benchmarks.put("NORMAL", incidentAnalysisService.analyzeCustomMetrics(normalInput));

        // Scenario B: High CPU
        Map<String, Object> cpuInput = new HashMap<>();
        cpuInput.put("deviceName", "Application-Server-01");
        cpuInput.put("cpu", 94.5);
        cpuInput.put("memory", 58.0);
        cpuInput.put("latency", 28.0);
        cpuInput.put("packetLoss", 0.2);
        cpuInput.put("traffic", 30.0);
        cpuInput.put("reachable", true);
        benchmarks.put("HIGH_CPU", incidentAnalysisService.analyzeCustomMetrics(cpuInput));

        // Scenario C: Network Congestion (Router-01 example from specification)
        Map<String, Object> congestionInput = new HashMap<>();
        congestionInput.put("deviceName", "Router-01 (Core Gateway)");
        congestionInput.put("cpu", 96.0);
        congestionInput.put("memory", 89.0);
        congestionInput.put("latency", 142.0);
        congestionInput.put("packetLoss", 7.1);
        congestionInput.put("traffic", 95.0);
        congestionInput.put("reachable", true);
        benchmarks.put("NETWORK_CONGESTION", incidentAnalysisService.analyzeCustomMetrics(congestionInput));

        // Scenario D: Packet Loss / Link Degradation
        Map<String, Object> lossInput = new HashMap<>();
        lossInput.put("deviceName", "Core-Switch-01");
        lossInput.put("cpu", 32.0);
        lossInput.put("memory", 44.0);
        lossInput.put("latency", 135.0);
        lossInput.put("packetLoss", 16.5);
        lossInput.put("traffic", 18.0);
        lossInput.put("reachable", true);
        benchmarks.put("PACKET_LOSS", incidentAnalysisService.analyzeCustomMetrics(lossInput));

        // Scenario E: Device Failure
        Map<String, Object> downInput = new HashMap<>();
        downInput.put("deviceName", "Main-Gateway");
        downInput.put("cpu", 0.0);
        downInput.put("memory", 0.0);
        downInput.put("latency", 0.0);
        downInput.put("packetLoss", 100.0);
        downInput.put("traffic", 0.0);
        downInput.put("reachable", false);
        benchmarks.put("DEVICE_DOWN", incidentAnalysisService.analyzeCustomMetrics(downInput));

        return ResponseEntity.ok(benchmarks);
    }
}
