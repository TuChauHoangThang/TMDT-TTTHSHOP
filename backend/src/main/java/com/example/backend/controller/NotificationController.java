package com.example.backend.controller;

import com.example.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {
    
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<?> getNotifications(@RequestHeader(value = "X-Customer-Id", required = false) String customerId) {
        if (customerId == null || customerId.isEmpty()) return ResponseEntity.badRequest().body("Missing customer ID");
        return ResponseEntity.ok(notificationService.getNotifications(customerId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(@RequestHeader(value = "X-Customer-Id", required = false) String customerId) {
        if (customerId == null || customerId.isEmpty()) return ResponseEntity.badRequest().body("Missing customer ID");
        return ResponseEntity.ok(notificationService.getUnreadCount(customerId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@RequestHeader(value = "X-Customer-Id", required = false) String customerId, @PathVariable Long id) {
        if (customerId == null || customerId.isEmpty()) return ResponseEntity.badRequest().body("Missing customer ID");
        try {
            notificationService.markAsRead(customerId, id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@RequestHeader(value = "X-Customer-Id", required = false) String customerId) {
        if (customerId == null || customerId.isEmpty()) return ResponseEntity.badRequest().body("Missing customer ID");
        notificationService.markAllAsRead(customerId);
        return ResponseEntity.ok().build();
    }
}
