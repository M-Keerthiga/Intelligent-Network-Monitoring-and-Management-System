package com.inmms.controller;

import com.inmms.dto.DashboardSummaryResponse;
import com.inmms.entity.Alert;
import com.inmms.entity.Device;
import com.inmms.entity.Metric;
import com.inmms.repository.AlertRepository;
import com.inmms.repository.DeviceRepository;
import com.inmms.repository.MetricRepository;
import com.inmms.service.DemoScenarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(originPatterns = "*")
public class DashboardController {

    private final DeviceRepository deviceRepository;
    private final MetricRepository metricRepository;
    private final AlertRepository alertRepository;
    private final DemoScenarioService demoScenarioService;

    public DashboardController(DeviceRepository deviceRepository,
                               MetricRepository metricRepository,
                               AlertRepository alertRepository,
                               DemoScenarioService demoScenarioService) {
        this.deviceRepository = deviceRepository;
        this.metricRepository = metricRepository;
        this.alertRepository = alertRepository;
        this.demoScenarioService = demoScenarioService;
    }

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        List<Device> devices = deviceRepository.findAll();
        long totalDevices = devices.size();

        long onlineDevices = 0;
        long warningDevices = 0;
        long criticalDevices = 0;
        long offlineDevices = 0;

        Map<String, Long> statusDist = new HashMap<>();
        statusDist.put("UP", 0L);
        statusDist.put("WARNING", 0L);
        statusDist.put("CRITICAL", 0L);
        statusDist.put("DOWN", 0L);

        double totalHealthScore = 0;
        double totalLatency = 0;
        double totalPacketLoss = 0;
        int activeMetricCount = 0;

        for (Device d : devices) {
            String status = d.getStatus() != null ? d.getStatus().toUpperCase() : "UP";
            statusDist.put(status, statusDist.getOrDefault(status, 0L) + 1);

            switch (status) {
                case "UP":
                    onlineDevices++;
                    break;
                case "WARNING":
                    warningDevices++;
                    break;
                case "CRITICAL":
                    criticalDevices++;
                    break;
                case "DOWN":
                    offlineDevices++;
                    break;
            }

            totalHealthScore += (d.getHealthScore() != null ? d.getHealthScore() : 100);

            Optional<Metric> latestOpt = metricRepository.findFirstByDeviceIdOrderByTimestampDesc(d.getId());
            if (latestOpt.isPresent()) {
                Metric m = latestOpt.get();
                if (m.getLatency() != null) totalLatency += m.getLatency();
                if (m.getPacketLoss() != null) totalPacketLoss += m.getPacketLoss();
                activeMetricCount++;
            }
        }

        int networkHealthScore = totalDevices > 0 ? (int) Math.round(totalHealthScore / totalDevices) : 100;
        double avgLatency = activeMetricCount > 0 ? Math.round((totalLatency / activeMetricCount) * 10.0) / 10.0 : 0.0;
        double avgPacketLoss = activeMetricCount > 0 ? Math.round((totalPacketLoss / activeMetricCount) * 10.0) / 10.0 : 0.0;

        List<Alert> openAlerts = alertRepository.findByStatusIn(Arrays.asList("OPEN", "ACKNOWLEDGED"));
        long criticalAlerts = openAlerts.stream().filter(a -> "CRITICAL".equalsIgnoreCase(a.getSeverity())).count();
        long warningAlerts = openAlerts.stream().filter(a -> "WARNING".equalsIgnoreCase(a.getSeverity())).count();

        DashboardSummaryResponse response = DashboardSummaryResponse.builder()
                .totalDevices(totalDevices)
                .onlineDevices(onlineDevices)
                .warningDevices(warningDevices)
                .criticalDevices(criticalDevices)
                .offlineDevices(offlineDevices)
                .criticalAlerts(criticalAlerts)
                .warningAlerts(warningAlerts)
                .averageLatency(avgLatency)
                .averagePacketLoss(avgPacketLoss)
                .networkHealthScore(networkHealthScore)
                .statusDistribution(statusDist)
                .activeScenario(demoScenarioService.getActiveScenario())
                .build();

        return ResponseEntity.ok(response);
    }
}
