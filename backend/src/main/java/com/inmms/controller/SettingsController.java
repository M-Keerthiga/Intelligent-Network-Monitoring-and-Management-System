package com.inmms.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(originPatterns = "*")
public class SettingsController {

    @Value("${inmms.monitoring.interval-ms:10000}")
    private long monitoringIntervalMs;

    @Value("${inmms.ml-service.enabled:true}")
    private boolean mlEnabled;

    @Value("${inmms.ml-service.url:http://localhost:5000/predict}")
    private String mlServiceUrl;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getSettings() {
        Map<String, Object> map = new HashMap<>();
        map.put("monitoringIntervalMs", monitoringIntervalMs);
        map.put("monitoringIntervalSeconds", monitoringIntervalMs / 1000);
        map.put("mlEnabled", mlEnabled);
        map.put("mlServiceUrl", mlServiceUrl);
        map.put("systemName", "Intelligent Network Monitoring & Management System (INMMS)");
        map.put("version", "1.0.0");
        return ResponseEntity.ok(map);
    }

    @PutMapping
    public ResponseEntity<Map<String, Object>> updateSettings(@RequestBody Map<String, Object> req) {
        if (req.containsKey("monitoringIntervalMs")) {
            this.monitoringIntervalMs = Long.parseLong(req.get("monitoringIntervalMs").toString());
        }
        if (req.containsKey("mlEnabled")) {
            this.mlEnabled = Boolean.parseBoolean(req.get("mlEnabled").toString());
        }

        Map<String, Object> map = new HashMap<>();
        map.put("success", true);
        map.put("monitoringIntervalMs", monitoringIntervalMs);
        map.put("mlEnabled", mlEnabled);
        map.put("message", "Settings updated successfully");
        return ResponseEntity.ok(map);
    }
}
