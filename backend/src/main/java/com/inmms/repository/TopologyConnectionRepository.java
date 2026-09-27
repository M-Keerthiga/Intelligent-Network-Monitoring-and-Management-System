package com.inmms.repository;

import com.inmms.entity.TopologyConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopologyConnectionRepository extends JpaRepository<TopologyConnection, Long> {
    List<TopologyConnection> findBySourceDeviceIdOrTargetDeviceId(Long sourceDeviceId, Long targetDeviceId);
}
