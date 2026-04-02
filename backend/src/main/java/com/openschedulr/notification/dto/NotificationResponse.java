package com.openschedulr.notification.dto;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID id,
        String title,
        String message,
        boolean readFlag,
        Instant createdAt
) {
}
