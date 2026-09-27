package com.inmms.config;

import com.inmms.entity.*;
import com.inmms.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final DeviceRepository deviceRepository;
    private final MetricRepository metricRepository;
    private final AlertRepository alertRepository;
    private final TopologyConnectionRepository topologyConnectionRepository;

    public DataInitializer(UserRepository userRepository,
                           DeviceRepository deviceRepository,
                           MetricRepository metricRepository,
                           AlertRepository alertRepository,
                           TopologyConnectionRepository topologyConnectionRepository) {
        this.userRepository = userRepository;
        this.deviceRepository = deviceRepository;
        this.metricRepository = metricRepository;
        this.alertRepository = alertRepository;
        this.topologyConnectionRepository = topologyConnectionRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedDevicesAndTopology();
    }

    private void seedUsers() {
        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@inmms.noc");
            admin.setPassword("admin123");
            admin.setRole("ADMIN");
            admin.setCreatedAt(LocalDateTime.now());
            userRepository.save(admin);
            logger.info("Default Administrator account created (username: admin / password: admin123)");
        }
    }

    private void seedDevicesAndTopology() {
        if (deviceRepository.count() > 0) {
            return;
        }

        logger.info("Seeding INMMS initial devices, topology connections, and historical monitoring metrics...");

        // 1. Create Devices
        Device d0 = createDevice("Local Host", "127.0.0.1", "Workstation", "NOC Console Room", "Local machine real-time monitoring agent");
        Device d1 = createDevice("Main-Gateway", "192.168.1.1", "Router", "Main Server Room", "Primary edge router and default gateway");
        Device d2 = createDevice("Core-Switch", "192.168.1.2", "Switch", "Core Rack 01", "High-speed L3 core network switch");
        Device d3 = createDevice("Application-Server", "192.168.1.10", "Server", "Data Center A", "Primary production application host");
        Device d4 = createDevice("Database-Server", "192.168.1.11", "Server", "Data Center B", "MySQL Enterprise database cluster node");
        Device d5 = createDevice("Main-Firewall", "192.168.1.254", "Firewall", "Perimeter Rack", "NGFW Security Firewall and Intrusion Prevention");
        Device d6 = createDevice("Access-Point", "192.168.1.20", "Access Point", "Building 1 Floor 2", "Enterprise Wi-Fi 6 wireless access point");

        List<Device> devices = Arrays.asList(d0, d1, d2, d3, d4, d5, d6);

        // 2. Create Topology Connections
        // Main-Firewall (d5) -> Main-Gateway (d1)
        createConnection(d5.getId(), d1.getId(), "Uplink");
        // Main-Gateway (d1) -> Core-Switch (d2)
        createConnection(d1.getId(), d2.getId(), "Fiber");
        // Core-Switch (d2) -> Application-Server (d3)
        createConnection(d2.getId(), d3.getId(), "Ethernet");
        // Core-Switch (d2) -> Database-Server (d4)
        createConnection(d2.getId(), d4.getId(), "Ethernet");
        // Core-Switch (d2) -> Access-Point (d6)
        createConnection(d2.getId(), d6.getId(), "Ethernet");
        // Core-Switch (d2) -> Local Host (d0)
        createConnection(d2.getId(), d0.getId(), "Ethernet");

        // 3. Seed 24 Hours of Historical Metrics
        Random random = new Random();
        LocalDateTime now = LocalDateTime.now();

        for (Device d : devices) {
            for (int i = 96; i >= 0; i--) { // 96 * 15min = 24 hours
                LocalDateTime ts = now.minusMinutes(i * 15L);
                Metric m = new Metric();
                m.setDeviceId(d.getId());
                m.setCpuUsage(Math.round((20.0 + random.nextDouble() * 30.0) * 10.0) / 10.0);
                m.setMemoryUsage(Math.round((35.0 + random.nextDouble() * 25.0) * 10.0) / 10.0);
                m.setLatency(Math.round((10.0 + random.nextDouble() * 25.0) * 10.0) / 10.0);
                m.setPacketLoss(0.0);
                m.setNetworkIn(Math.round((10.0 + random.nextDouble() * 20.0) * 10.0) / 10.0);
                m.setNetworkOut(Math.round((5.0 + random.nextDouble() * 15.0) * 10.0) / 10.0);
                m.setTimestamp(ts);
                metricRepository.save(m);
            }
        }

        logger.info("INMMS Database Seeding completed successfully with 7 devices and 24h historical telemetry!");
    }

    private Device createDevice(String name, String ip, String type, String location, String desc) {
        Device d = new Device();
        d.setName(name);
        d.setIpAddress(ip);
        d.setDeviceType(type);
        d.setLocation(location);
        d.setDescription(desc);
        d.setMonitoringEnabled(true);
        d.setStatus("UP");
        d.setHealthScore(98);
        d.setLastSeen(LocalDateTime.now());
        d.setCreatedAt(LocalDateTime.now());
        return deviceRepository.save(d);
    }

    private void createConnection(Long sourceId, Long targetId, String type) {
        TopologyConnection conn = new TopologyConnection();
        conn.setSourceDeviceId(sourceId);
        conn.setTargetDeviceId(targetId);
        conn.setConnectionType(type);
        conn.setCreatedAt(LocalDateTime.now());
        topologyConnectionRepository.save(conn);
    }
}
