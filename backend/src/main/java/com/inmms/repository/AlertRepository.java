package com.inmms.repository;

import com.inmms.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByStatusOrderByCreatedAtDesc(String status);
    List<Alert> findByDeviceIdOrderByCreatedAtDesc(Long deviceId);
    List<Alert> findAllByOrderByCreatedAtDesc();

    @Query("SELECT a FROM Alert a WHERE a.deviceId = :deviceId AND a.alertType = :alertType AND a.status IN ('OPEN', 'ACKNOWLEDGED')")
    Optional<Alert> findActiveAlertByDeviceAndType(@Param("deviceId") Long deviceId, @Param("alertType") String alertType);
    
    List<Alert> findByStatusIn(List<String> statuses);
}
