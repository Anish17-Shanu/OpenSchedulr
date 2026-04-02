package com.openschedulr.notification.repository;

import com.openschedulr.notification.model.Notification;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findTop20ByUser_EmailOrderByCreatedAtDesc(String email);
}
