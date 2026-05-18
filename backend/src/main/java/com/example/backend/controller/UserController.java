package com.example.backend.controller;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    /**
     * GET /api/user/{id}
     * Lấy thông tin user theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProfile(@PathVariable Long id) {
        return userRepository.findById(id)
            .map(user -> ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "fullName", user.getFullName() != null ? user.getFullName() : "",
                "email", user.getEmail() != null ? user.getEmail() : "",
                "phone", user.getPhone() != null ? user.getPhone() : ""
            )))
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * PUT /api/user/{id}
     * Cập nhật thông tin cá nhân (fullName, phone) vào database
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return userRepository.findById(id).map(user -> {
            if (body.containsKey("fullName") && !body.get("fullName").isBlank()) {
                user.setFullName(body.get("fullName"));
            }
            if (body.containsKey("phone")) {
                user.setPhone(body.get("phone"));
            }
            if (body.containsKey("email") && !body.get("email").isBlank()) {
                String newEmail = body.get("email").trim();
                if (!newEmail.equals(user.getEmail()) && userRepository.existsByEmail(newEmail)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Email đã được sử dụng bởi tài khoản khác"));
                }
                user.setEmail(newEmail);
            }
            userRepository.save(user);
            return ResponseEntity.ok(Map.of(
                "message", "Cập nhật thông tin thành công",
                "fullName", user.getFullName() != null ? user.getFullName() : "",
                "phone", user.getPhone() != null ? user.getPhone() : "",
                "email", user.getEmail() != null ? user.getEmail() : ""
            ));
        }).orElse(ResponseEntity.notFound().build());
    }
}
