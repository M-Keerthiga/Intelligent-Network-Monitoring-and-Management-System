package com.inmms.controller;

import com.inmms.entity.Alert;
import com.inmms.repository.AlertRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(originPatterns = "*")
public class AlertController {

    private final AlertRepository alertRepository;

    public AlertController(AlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    @GetMapping
    public ResponseEntity<List<Alert>> getAllAlerts() {
        return ResponseEntity.ok(alertRepository.findAllByOrderByCreatedAtDesc());
    }

    @PutMapping("/{id}/acknowledge")
    public ResponseEntity<?> acknowledgeAlert(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        Optional<Alert> opt = alertRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Alert alert = opt.get();
        alert.setStatus("ACKNOWLEDGED");
        alert.setAcknowledgedAt(LocalDateTime.now());
        String user = (body != null && body.containsKey("username")) ? body.get("username") : "admin";
        alert.setAcknowledgedBy(user);

        Alert saved = alertRepository.save(alert);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> resolveAlert(@PathVariable Long id) {
        Optional<Alert> opt = alertRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Alert alert = opt.get();
        alert.setStatus("RESOLVED");
        alert.setResolvedAt(LocalDateTime.now());

        Alert saved = alertRepository.save(alert);
        return ResponseEntity.ok(saved);
    }
}
