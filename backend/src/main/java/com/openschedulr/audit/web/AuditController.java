package com.openschedulr.audit.web;

import com.openschedulr.audit.dto.AuditLogResponse;
import com.openschedulr.audit.service.AuditService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @GetMapping("/logs")
    @PreAuthorize("hasRole('ADMIN')")
    public List<AuditLogResponse> list(@RequestParam(defaultValue = "20") int limit) {
        return auditService.getRecentLogs(Math.min(Math.max(limit, 1), 100));
    }
}
