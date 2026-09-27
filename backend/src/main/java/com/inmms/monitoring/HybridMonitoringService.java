package com.inmms.monitoring;

import com.inmms.entity.Device;
import com.inmms.entity.Metric;
import com.inmms.repository.DeviceRepository;
import com.inmms.repository.MetricRepository;
import com.inmms.service.DemoScenarioService;
import oshi.SystemInfo;
import oshi.hardware.CentralProcessor;
import oshi.hardware.GlobalMemory;
import oshi.hardware.HardwareAbstractionLayer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.InetAddress;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;

@Service
public class HybridMonitoringService {

    private static final Logger logger = LoggerFactory.getLogger(HybridMonitoringService.class);

    private final DeviceRepository deviceRepository;
    private final MetricRepository metricRepository;
    private final HealthScoreCalculator healthScoreCalculator;
    private final AnomalyDetectionService anomalyDetectionService;
    private final DemoScenarioService demoScenarioService;

    private final Random random = new Random();
    private SystemInfo systemInfo;
    private HardwareAbstractionLayer hardware;
    private long[] prevTicks;

    public HybridMonitoringService(DeviceRepository deviceRepository,
                                   MetricRepository metricRepository,
                                   HealthScoreCalculator healthScoreCalculator,
                                   AnomalyDetectionService anomalyDetectionService,
                                   DemoScenarioService demoScenarioService) {
        this.deviceRepository = deviceRepository;
        this.metricRepository = metricRepository;
        this.healthScoreCalculator = healthScoreCalculator;
        this.anomalyDetectionService = anomalyDetectionService;
        this.demoScenarioService = demoScenarioService;

        try {
            this.systemInfo = new SystemInfo();
            this.hardware = systemInfo.getHardware();
            this.prevTicks = hardware.getProcessor().getSystemCpuLoadTicks();
        } catch (Throwable t) {
            logger.warn("OSHI SystemInfo initialization warning (will fallback safely): {}", t.getMessage());
        }
    }

    @Scheduled(fixedRateString = "${inmms.monitoring.interval-ms:10000}")
    @Transactional
    public void runMonitoringCycle() {
        List<Device> devices = deviceRepository.findByMonitoringEnabled(true);
        if (devices.isEmpty()) {
            return;
        }

        String activeScenario = demoScenarioService.getActiveScenario();
        Long targetDeviceId = demoScenarioService.getTargetDeviceId();

        for (Device device : devices) {
            try {
                Metric metric = new Metric();
                metric.setDeviceId(device.getId());
                metric.setTimestamp(LocalDateTime.now());

                boolean isReachable = true;

                if ("Local Host".equalsIgnoreCase(device.getName()) || "127.0.0.1".equals(device.getIpAddress()) || "Workstation".equalsIgnoreCase(device.getDeviceType()) && device.getIpAddress().contains("localhost")) {
                    // MODE 1: REAL LOCAL MACHINE MONITORING
                    collectLocalMachineMetrics(metric);
                } else {
                    // MODE 2: SIMULATED NETWORK DEVICES MONITORING
                    isReachable = collectSimulatedMetrics(device, metric, activeScenario, targetDeviceId);
                }

                // Save Metric record
                metricRepository.save(metric);

                // Calculate Health Score & Device Status
                HealthScoreCalculator.HealthResult healthResult = healthScoreCalculator.calculate(
                        isReachable,
                        metric.getCpuUsage() != null ? metric.getCpuUsage() : 0.0,
                        metric.getMemoryUsage() != null ? metric.getMemoryUsage() : 0.0,
                        metric.getLatency() != null ? metric.getLatency() : 0.0,
                        metric.getPacketLoss() != null ? metric.getPacketLoss() : 0.0
                );

                // Update Device Entity
                device.setHealthScore(healthResult.getHealthScore());
                device.setStatus(healthResult.getStatus());
                if (isReachable) {
                    device.setLastSeen(LocalDateTime.now());
                }
                deviceRepository.save(device);

                // Evaluate Faults & Generate Alerts
                anomalyDetectionService.evaluate(device, metric, isReachable);

            } catch (Exception e) {
                logger.error("Error monitoring device {}: {}", device.getName(), e.getMessage());
            }
        }
    }

    private void collectLocalMachineMetrics(Metric metric) {
        try {
            if (hardware != null) {
                CentralProcessor processor = hardware.getProcessor();
                double cpuLoad = processor.getSystemCpuLoadBetweenTicks(prevTicks) * 100.0;
                this.prevTicks = processor.getSystemCpuLoadTicks();
                if (Double.isNaN(cpuLoad) || cpuLoad < 0) {
                    cpuLoad = 15.0 + random.nextDouble() * 10.0;
                }
                metric.setCpuUsage(Math.round(cpuLoad * 10.0) / 10.0);

                GlobalMemory memory = hardware.getMemory();
                long totalMem = memory.getTotal();
                long availMem = memory.getAvailable();
                double memUsage = ((double) (totalMem - availMem) / totalMem) * 100.0;
                metric.setMemoryUsage(Math.round(memUsage * 10.0) / 10.0);
            } else {
                metric.setCpuUsage(Math.round((20.0 + random.nextDouble() * 15.0) * 10.0) / 10.0);
                metric.setMemoryUsage(Math.round((45.0 + random.nextDouble() * 10.0) * 10.0) / 10.0);
            }

            // Measure local loopback ping latency
            long start = System.currentTimeMillis();
            boolean pinged = InetAddress.getByName("127.0.0.1").isReachable(1000);
            long end = System.currentTimeMillis();
            double latency = pinged ? Math.max(1.0, (end - start)) : 5.0;

            metric.setLatency(latency);
            metric.setPacketLoss(0.0);
            metric.setNetworkIn(Math.round((5.0 + random.nextDouble() * 10.0) * 10.0) / 10.0);
            metric.setNetworkOut(Math.round((3.0 + random.nextDouble() * 8.0) * 10.0) / 10.0);

        } catch (Exception e) {
            metric.setCpuUsage(25.0);
            metric.setMemoryUsage(50.0);
            metric.setLatency(2.0);
            metric.setPacketLoss(0.0);
            metric.setNetworkIn(10.0);
            metric.setNetworkOut(5.0);
        }
    }

    private boolean collectSimulatedMetrics(Device device, Metric metric, String activeScenario, Long targetDeviceId) {
        boolean isReachable = true;

        // Base realistic healthy values for simulated device
        double baseCpu = 25.0 + (random.nextDouble() * 20.0); // 25-45%
        double baseMem = 40.0 + (random.nextDouble() * 20.0); // 40-60%
        double baseLat = 12.0 + (random.nextDouble() * 25.0); // 12-37ms
        double baseLoss = 0.0;
        double baseNetIn = 12.0 + (random.nextDouble() * 20.0); // 12-32 MB/s
        double baseNetOut = 8.0 + (random.nextDouble() * 15.0); // 8-23 MB/s

        boolean isTarget = (targetDeviceId != null && targetDeviceId.equals(device.getId()))
                || (targetDeviceId == null && matchesScenarioDefaultDevice(device, activeScenario));

        if (isTarget && !"NORMAL".equalsIgnoreCase(activeScenario)) {
            switch (activeScenario) {
                case "HIGH_CPU":
                    baseCpu = 91.0 + (random.nextDouble() * 7.0); // 91-98%
                    break;
                case "HIGH_MEMORY":
                    baseMem = 89.0 + (random.nextDouble() * 8.0); // 89-97%
                    break;
                case "HIGH_LATENCY":
                    baseLat = 215.0 + (random.nextDouble() * 180.0); // 215-395ms
                    break;
                case "PACKET_LOSS":
                    baseLoss = 12.0 + (random.nextDouble() * 10.0); // 12-22%
                    baseLat = 85.0 + (random.nextDouble() * 30.0);
                    break;
                case "DEVICE_DOWN":
                    isReachable = false;
                    baseCpu = 0.0;
                    baseMem = 0.0;
                    baseLat = 0.0;
                    baseLoss = 100.0;
                    baseNetIn = 0.0;
                    baseNetOut = 0.0;
                    break;
                case "TRAFFIC_SPIKE":
                    baseNetIn = 95.0 + (random.nextDouble() * 60.0); // 95-155 MB/s
                    baseNetOut = 85.0 + (random.nextDouble() * 50.0);
                    baseCpu = 75.0 + (random.nextDouble() * 15.0);
                    break;
                case "DEGRADED":
                    baseCpu = 84.0 + (random.nextDouble() * 5.0);
                    baseMem = 82.0 + (random.nextDouble() * 5.0);
                    baseLat = 140.0 + (random.nextDouble() * 40.0);
                    baseLoss = 6.0 + (random.nextDouble() * 3.0);
                    break;
            }
        }

        metric.setCpuUsage(Math.round(baseCpu * 10.0) / 10.0);
        metric.setMemoryUsage(Math.round(baseMem * 10.0) / 10.0);
        metric.setLatency(Math.round(baseLat * 10.0) / 10.0);
        metric.setPacketLoss(Math.round(baseLoss * 10.0) / 10.0);
        metric.setNetworkIn(Math.round(baseNetIn * 10.0) / 10.0);
        metric.setNetworkOut(Math.round(baseNetOut * 10.0) / 10.0);

        return isReachable;
    }

    private boolean matchesScenarioDefaultDevice(Device device, String scenario) {
        String name = device.getName().toLowerCase();
        switch (scenario) {
            case "HIGH_CPU":
                return name.contains("application") || name.contains("app") || name.contains("server");
            case "HIGH_MEMORY":
                return name.contains("database") || name.contains("db");
            case "HIGH_LATENCY":
                return name.contains("gateway") || name.contains("router");
            case "PACKET_LOSS":
                return name.contains("switch");
            case "DEVICE_DOWN":
                return name.contains("gateway") || name.contains("app");
            case "TRAFFIC_SPIKE":
                return name.contains("firewall") || name.contains("switch");
            default:
                return false;
        }
    }
}
