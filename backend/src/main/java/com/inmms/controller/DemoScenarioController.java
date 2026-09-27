package com.inmms.controller;

import com.inmms.dto.DemoScenarioRequest;
import com.inmms.entity.Device;
import com.inmms.monitoring.HybridMonitoringService;
import com.inmms.repository.DeviceRepository;
import com.inmms.service.DemoScenarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/demo")
@CrossOrigin(originPatterns = "*")
public class DemoScenarioController {

    private final DemoScenarioService demoScenarioService;
    private final HybridMonitoringService hybridMonitoringService;
    private final DeviceRepository deviceRepository;

    public DemoScenarioController(DemoScenarioService demoScenarioService,
                                  HybridMonitoringService hybridMonitoringService,
                                  DeviceRepository deviceRepository) {
        this.demoScenarioService = demoScenarioService;
        this.hybridMonitoringService = hybridMonitoringService;
        this.deviceRepository = deviceRepository;
    }

    @GetMapping("/scenario")
    public ResponseEntity<Map<String, Object>> getActiveScenario() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("activeScenario", demoScenarioService.getActiveScenario());
        resp.put("targetDeviceId", demoScenarioService.getTargetDeviceId());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/scenario")
    public ResponseEntity<Map<String, Object>> triggerScenario(@RequestBody DemoScenarioRequest req) {
        demoScenarioService.setScenario(req.getScenario(), req.getDeviceId());

        // Immediately execute monitoring cycle to trigger instant health/alert updates!
        hybridMonitoringService.runMonitoringCycle();

        String deviceName = "Default Scenario Device";
        if (req.getDeviceId() != null) {
            Optional<Device> d = deviceRepository.findById(req.getDeviceId());
            if (d.isPresent()) {
                deviceName = d.get().getName();
            }
        }

        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("scenario", demoScenarioService.getActiveScenario());
        resp.put("device", deviceName);
        resp.put("message", "Demo scenario activated successfully");
        return ResponseEntity.ok(resp);
    }
}
