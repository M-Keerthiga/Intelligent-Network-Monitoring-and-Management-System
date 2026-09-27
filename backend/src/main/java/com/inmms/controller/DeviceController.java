package com.inmms.controller;

import com.inmms.entity.Alert;
import com.inmms.entity.Device;
import com.inmms.entity.Metric;
import com.inmms.repository.AlertRepository;
import com.inmms.repository.DeviceRepository;
import com.inmms.repository.MetricRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/devices")
@CrossOrigin(originPatterns = "*")
public class DeviceController {

    private final DeviceRepository deviceRepository;
    private final MetricRepository metricRepository;
    private final AlertRepository alertRepository;

    public DeviceController(DeviceRepository deviceRepository,
                            MetricRepository metricRepository,
                            AlertRepository alertRepository) {
        this.deviceRepository = deviceRepository;
        this.metricRepository = metricRepository;
        this.alertRepository = alertRepository;
    }

    @GetMapping
    public ResponseEntity<List<Device>> getAllDevices() {
        return ResponseEntity.ok(deviceRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Device> getDeviceById(@PathVariable Long id) {
        return deviceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createDevice(@RequestBody Device device) {
        if (device.getName() == null || device.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Device name is required");
        }
        if (device.getIpAddress() == null || device.getIpAddress().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Device IP address is required");
        }
        if (device.getDeviceType() == null || device.getDeviceType().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Device type is required");
        }

        device.setStatus("UP");
        device.setHealthScore(100);
        device.setLastSeen(LocalDateTime.now());
        device.setCreatedAt(LocalDateTime.now());
        if (device.getMonitoringEnabled() == null) {
            device.setMonitoringEnabled(true);
        }

        Device saved = deviceRepository.save(device);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDevice(@PathVariable Long id, @RequestBody Device updated) {
        Optional<Device> opt = deviceRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Device existing = opt.get();
        if (updated.getName() != null) existing.setName(updated.getName());
        if (updated.getIpAddress() != null) existing.setIpAddress(updated.getIpAddress());
        if (updated.getDeviceType() != null) existing.setDeviceType(updated.getDeviceType());
        if (updated.getLocation() != null) existing.setLocation(updated.getLocation());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        if (updated.getMonitoringEnabled() != null) existing.setMonitoringEnabled(updated.getMonitoringEnabled());

        Device saved = deviceRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDevice(@PathVariable Long id) {
        if (!deviceRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        deviceRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/metrics")
    public ResponseEntity<List<Metric>> getDeviceMetrics(@PathVariable Long id,
                                                         @RequestParam(value = "range", defaultValue = "24h") String range) {
        LocalDateTime since;
        switch (range.toLowerCase()) {
            case "1h":
                since = LocalDateTime.now().minusHours(1);
                break;
            case "6h":
                since = LocalDateTime.now().minusHours(6);
                break;
            case "7d":
                since = LocalDateTime.now().minusDays(7);
                break;
            case "24h":
            default:
                since = LocalDateTime.now().minusHours(24);
                break;
        }

        List<Metric> metrics = metricRepository.findByDeviceIdAndTimestampAfter(id, since);
        if (metrics.isEmpty()) {
            metrics = metricRepository.findByDeviceIdOrderByTimestampDesc(id);
            if (metrics.size() > 50) {
                metrics = metrics.subList(0, 50);
            }
        }
        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/{id}/alerts")
    public ResponseEntity<List<Alert>> getDeviceAlerts(@PathVariable Long id) {
        return ResponseEntity.ok(alertRepository.findByDeviceIdOrderByCreatedAtDesc(id));
    }
}
