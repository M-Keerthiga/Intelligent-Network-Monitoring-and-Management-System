package com.inmms.controller;

import com.inmms.dto.TopologyDTO;
import com.inmms.entity.Device;
import com.inmms.entity.TopologyConnection;
import com.inmms.repository.DeviceRepository;
import com.inmms.repository.TopologyConnectionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/topology")
@CrossOrigin(originPatterns = "*")
public class TopologyController {

    private final DeviceRepository deviceRepository;
    private final TopologyConnectionRepository topologyConnectionRepository;

    public TopologyController(DeviceRepository deviceRepository,
                              TopologyConnectionRepository topologyConnectionRepository) {
        this.deviceRepository = deviceRepository;
        this.topologyConnectionRepository = topologyConnectionRepository;
    }

    @GetMapping
    public ResponseEntity<TopologyDTO> getTopology() {
        List<Device> devices = deviceRepository.findAll();
        List<TopologyConnection> connections = topologyConnectionRepository.findAll();

        List<TopologyDTO.DeviceNode> nodes = devices.stream().map(d -> new TopologyDTO.DeviceNode(
                d.getId(),
                d.getName(),
                d.getIpAddress(),
                d.getDeviceType(),
                d.getStatus(),
                d.getHealthScore()
        )).collect(Collectors.toList());

        return ResponseEntity.ok(new TopologyDTO(nodes, connections));
    }

    @PostMapping("/connections")
    public ResponseEntity<?> addConnection(@RequestBody TopologyConnection conn) {
        if (conn.getSourceDeviceId() == null || conn.getTargetDeviceId() == null) {
            return ResponseEntity.badRequest().body("Source and Target device IDs are required");
        }
        conn.setCreatedAt(LocalDateTime.now());
        TopologyConnection saved = topologyConnectionRepository.save(conn);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/connections/{id}")
    public ResponseEntity<?> deleteConnection(@PathVariable Long id) {
        if (!topologyConnectionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        topologyConnectionRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
