package com.openschedulr.audit.dto;

import java.time.Instant;
import java.util.UUID;

public record AuditLogResponse(
        UUID id,
        String actorEmail,
        String action,
        String targetType,
        String targetId,
        String detail,
        Instant createdAt
) {
}
