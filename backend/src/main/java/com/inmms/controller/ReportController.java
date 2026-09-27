package com.inmms.controller;

import com.inmms.dto.ReportSummaryResponse;
import com.inmms.entity.Alert;
import com.inmms.entity.Device;
import com.inmms.entity.Metric;
import com.inmms.repository.AlertRepository;
import com.inmms.repository.DeviceRepository;
import com.inmms.repository.MetricRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(originPatterns = "*")
public class ReportController {

    private final DeviceRepository deviceRepository;
    private final MetricRepository metricRepository;
    private final AlertRepository alertRepository;

    public ReportController(DeviceRepository deviceRepository,
                            MetricRepository metricRepository,
                            AlertRepository alertRepository) {
        this.deviceRepository = deviceRepository;
        this.metricRepository = metricRepository;
        this.alertRepository = alertRepository;
    }

    @GetMapping
    public ResponseEntity<ReportSummaryResponse> getReportSummary() {
        List<Device> devices = deviceRepository.findAll();
        List<Alert> allAlerts = alertRepository.findAllByOrderByCreatedAtDesc();

        long totalDevices = devices.size();
        long onlineCount = devices.stream().filter(d -> !"DOWN".equalsIgnoreCase(d.getStatus())).count();
        double availPct = totalDevices > 0 ? Math.round(((double) onlineCount / totalDevices * 100.0) * 10.0) / 10.0 : 100.0;

        double totalLat = 0;
        double totalLoss = 0;
        int metricCount = 0;

        String highestCpuDevice = "None";
        double highestCpuVal = 0.0;

        String highestLatDevice = "None";
        double highestLatVal = 0.0;

        List<ReportSummaryResponse.ProblematicDeviceDTO> probDevices = new ArrayList<>();

        for (Device d : devices) {
            Optional<Metric> latestOpt = metricRepository.findFirstByDeviceIdOrderByTimestampDesc(d.getId());
            if (latestOpt.isPresent()) {
                Metric m = latestOpt.get();
                if (m.getLatency() != null) totalLat += m.getLatency();
                if (m.getPacketLoss() != null) totalLoss += m.getPacketLoss();
                metricCount++;

                if (m.getCpuUsage() != null && m.getCpuUsage() > highestCpuVal) {
                    highestCpuVal = m.getCpuUsage();
                    highestCpuDevice = d.getName();
                }
                if (m.getLatency() != null && m.getLatency() > highestLatVal) {
                    highestLatVal = m.getLatency();
                    highestLatDevice = d.getName();
                }
            }

            long alertCount = allAlerts.stream().filter(a -> d.getId().equals(a.getDeviceId())).count();
            if (alertCount > 0 || !"UP".equalsIgnoreCase(d.getStatus())) {
                probDevices.add(new ReportSummaryResponse.ProblematicDeviceDTO(
                        d.getId(), d.getName(), d.getIpAddress(), d.getDeviceType(), d.getStatus(), d.getHealthScore(), alertCount
                ));
            }
        }

        probDevices.sort((a, b) -> Long.compare(b.getAlertCount(), a.getAlertCount()));

        long criticalAlerts = allAlerts.stream().filter(a -> "CRITICAL".equalsIgnoreCase(a.getSeverity())).count();
        long warningAlerts = allAlerts.stream().filter(a -> "WARNING".equalsIgnoreCase(a.getSeverity())).count();
        long resolvedAlerts = allAlerts.stream().filter(a -> "RESOLVED".equalsIgnoreCase(a.getStatus())).count();

        ReportSummaryResponse resp = ReportSummaryResponse.builder()
                .totalDevices(totalDevices)
                .availabilityPercentage(availPct)
                .averageLatency(metricCount > 0 ? Math.round((totalLat / metricCount) * 10.0) / 10.0 : 0.0)
                .averagePacketLoss(metricCount > 0 ? Math.round((totalLoss / metricCount) * 10.0) / 10.0 : 0.0)
                .totalAlerts(allAlerts.size())
                .criticalAlerts(criticalAlerts)
                .warningAlerts(warningAlerts)
                .resolvedAlerts(resolvedAlerts)
                .highestCpuDevice(highestCpuDevice)
                .highestCpuValue(highestCpuVal)
                .highestLatencyDevice(highestLatDevice)
                .highestLatencyValue(highestLatVal)
                .problematicDevices(probDevices)
                .build();

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/export-csv")
    public ResponseEntity<byte[]> exportReportCsv() {
        List<Device> devices = deviceRepository.findAll();
        StringBuilder csv = new StringBuilder();
        csv.append("Device ID,Device Name,IP Address,Type,Location,Status,Health Score,Last CPU (%),Last Memory (%),Last Latency (ms),Last Packet Loss (%)\n");

        for (Device d : devices) {
            Optional<Metric> latestOpt = metricRepository.findFirstByDeviceIdOrderByTimestampDesc(d.getId());
            double cpu = latestOpt.map(Metric::getCpuUsage).orElse(0.0);
            double mem = latestOpt.map(Metric::getMemoryUsage).orElse(0.0);
            double lat = latestOpt.map(Metric::getLatency).orElse(0.0);
            double loss = latestOpt.map(Metric::getPacketLoss).orElse(0.0);

            csv.append(String.format("%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%d,%.1f,%.1f,%.1f,%.1f\n",
                    d.getId(), d.getName(), d.getIpAddress(), d.getDeviceType(), d.getLocation(), d.getStatus(), d.getHealthScore(), cpu, mem, lat, loss));
        }

        byte[] bytes = csv.toString().getBytes();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=inmms_network_report.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(bytes);
    }
}
