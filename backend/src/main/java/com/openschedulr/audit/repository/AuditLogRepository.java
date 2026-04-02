package com.openschedulr.audit.repository;

import com.openschedulr.audit.model.AuditLog;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findTop20ByOrderByCreatedAtDesc();
}
