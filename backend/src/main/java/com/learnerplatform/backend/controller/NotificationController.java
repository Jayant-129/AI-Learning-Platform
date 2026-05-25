package com.learnerplatform.backend.controller;

import com.learnerplatform.backend.model.Notification;
import com.learnerplatform.backend.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private static final Logger log = LoggerFactory.getLogger(NotificationController.class);

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getNotifications(@PathVariable Long userId) {
        log.info("Fetching notifications for user: {}", userId);
        return ResponseEntity.ok(
            notificationService.getNotifications(userId).stream()
                .map(this::toDto).collect(Collectors.toList())
        );
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<Map<String, Object>> getUnread(@PathVariable Long userId) {
        List<Map<String, Object>> items = notificationService.getUnreadNotifications(userId)
                .stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of(
                "notifications", items,
                "count", notificationService.getUnreadCount(userId)
        ));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        String message = (String) request.get("message");
        String type = (String) request.getOrDefault("type", "INFO");
        return ResponseEntity.ok(toDto(notificationService.createNotification(userId, message, type)));
    }

    private Map<String, Object> toDto(Notification n) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", n.getId());
        dto.put("userId", n.getUser() != null ? n.getUser().getId() : null);
        dto.put("message", n.getMessage());
        dto.put("type", n.getType());
        dto.put("read", n.getRead());
        dto.put("createdAt", n.getCreatedAt());
        return dto;
    }
}

