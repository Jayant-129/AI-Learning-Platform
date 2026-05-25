package com.learnerplatform.backend.controller;

import com.learnerplatform.backend.exception.ResourceNotFoundException;
import com.learnerplatform.backend.model.Role;
import com.learnerplatform.backend.model.User;
import com.learnerplatform.backend.repository.UserRepository;
import com.learnerplatform.backend.service.NotificationService;
import com.learnerplatform.backend.service.NotificationPushService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final NotificationPushService notificationPushService;

    public UserController(UserRepository userRepository,
                          NotificationService notificationService,
                          NotificationPushService notificationPushService) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.notificationPushService = notificationPushService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        log.info("Admin fetching all users");
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/mentors")
    @PreAuthorize("hasAnyRole('ADMIN', 'MENTOR')")
    public ResponseEntity<List<User>> getMentors() {
        log.info("Fetching mentors");
        return ResponseEntity.ok(userRepository.findByRole(Role.MENTOR));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateRole(@PathVariable Long id, @RequestBody Map<String, String> request) {
        log.info("Admin updating role for user: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        String oldRole = user.getRole().name();
        Role newRole;
        try {
            newRole = Role.valueOf(request.get("role").toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role: " + request.get("role"));
        }

        user.setRole(newRole);
        User saved = userRepository.save(user);

        // Notify the user about their role change
        try {
            String msg = String.format("Your account role has been changed from %s to %s by Admin",
                    oldRole, newRole.name());
            notificationService.createNotification(saved.getId(), msg, "ROLE_CHANGE");
            notificationPushService.pushToUser(saved.getId(), msg, "ROLE_CHANGE");
            log.info("Role change notification sent to user {}", saved.getId());
        } catch (Exception e) {
            log.warn("Failed to send role change notification: {}", e.getMessage());
        }

        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.info("Admin deleting user: {}", id);
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found: " + id);
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
