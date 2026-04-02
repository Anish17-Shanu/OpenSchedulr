package com.openschedulr.audit.service;

import com.openschedulr.audit.model.AuditLog;
import com.openschedulr.audit.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public void log(String actorEmail, String action, String targetType, String targetId, String detail) {
        AuditLog auditLog = new AuditLog();
        auditLog.setActorEmail(actorEmail);
        auditLog.setAction(action);
        auditLog.setTargetType(targetType);
        auditLog.setTargetId(targetId);
        auditLog.setDetail(detail);
        auditLogRepository.save(auditLog);
    }
}
