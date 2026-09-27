package com.inmms.controller;

import com.inmms.entity.Metric;
import com.inmms.repository.MetricRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/metrics")
@CrossOrigin(originPatterns = "*")
public class MetricsController {

    private final MetricRepository metricRepository;

    public MetricsController(MetricRepository metricRepository) {
        this.metricRepository = metricRepository;
    }

    @GetMapping
    public ResponseEntity<List<Metric>> getRecentMetrics(@RequestParam(value = "limit", defaultValue = "100") int limit) {
        return ResponseEntity.ok(metricRepository.findRecentMetrics(PageRequest.of(0, Math.min(limit, 500))));
    }
}
