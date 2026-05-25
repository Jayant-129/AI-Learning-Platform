package com.learnerplatform.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Pushes real-time notifications via the Node.js Socket.IO service.
 * Calls POST /notify on the notification service which then emits a Socket.IO event
 * to the target user's room so they see it immediately in the frontend.
 */
@Service
public class NotificationPushService {

    private static final Logger log = LoggerFactory.getLogger(NotificationPushService.class);

    @Value("${app.notification-service.url}")
    private String notificationServiceUrl;

    private final RestTemplate restTemplate;

    public NotificationPushService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Push a real-time notification to a specific user.
     */
    public void pushToUser(Long userId, String message, String type) {
        try {
            String url = notificationServiceUrl + "/notify";
            Map<String, Object> body = Map.of(
                    "userId", userId,
                    "message", message,
                    "type", type != null ? type : "INFO"
            );
            restTemplate.postForEntity(url, body, Map.class);
            log.info("Pushed real-time notification to user {}: {}", userId, message);
        } catch (Exception e) {
            log.warn("Failed to push real-time notification to user {}: {}", userId, e.getMessage());
            // Non-fatal — DB notification still exists
        }
    }

    /**
     * Broadcast a notification to all connected users.
     */
    public void broadcast(String message, String type) {
        try {
            String url = notificationServiceUrl + "/notify/broadcast";
            Map<String, Object> body = Map.of(
                    "message", message,
                    "type", type != null ? type : "INFO"
            );
            restTemplate.postForEntity(url, body, Map.class);
            log.info("Broadcast notification: {}", message);
        } catch (Exception e) {
            log.warn("Failed to broadcast notification: {}", e.getMessage());
        }
    }
}
