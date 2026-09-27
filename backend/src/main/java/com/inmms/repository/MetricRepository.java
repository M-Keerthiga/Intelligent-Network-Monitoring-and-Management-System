package com.inmms.repository;

import com.inmms.entity.Metric;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MetricRepository extends JpaRepository<Metric, Long> {
    List<Metric> findByDeviceIdOrderByTimestampDesc(Long deviceId);
    
    @Query("SELECT m FROM Metric m WHERE m.deviceId = :deviceId AND m.timestamp >= :since ORDER BY m.timestamp ASC")
    List<Metric> findByDeviceIdAndTimestampAfter(@Param("deviceId") Long deviceId, @Param("since") LocalDateTime since);

    @Query("SELECT m FROM Metric m ORDER BY m.timestamp DESC")
    List<Metric> findRecentMetrics(Pageable pageable);

    Optional<Metric> findFirstByDeviceIdOrderByTimestampDesc(Long deviceId);
}
