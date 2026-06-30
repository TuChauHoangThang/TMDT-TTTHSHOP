package com.example.backend.controller;

import com.example.backend.dto.auth.AuthResponse;
import com.example.backend.dto.auth.LoginRequest;
import com.example.backend.dto.auth.RegisterRequest;
import com.example.backend.service.AuthService;
import com.example.backend.entity.User;
import com.example.backend.entity.Role;
import com.example.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthService authService, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/reset-admin")
    public ResponseEntity<?> resetAdmin() {
        try {
            User u1 = userRepository.findByEmail("admin@test.com").orElse(null);
            if (u1 == null) {
                u1 = new User();
                u1.setEmail("admin@test.com");
                u1.setFullName("Admin TTTH");
                u1.setPhone("0900000001");
                u1.setRole(Role.ADMIN);
                u1.setActive(true);
            }
            u1.setPassword(passwordEncoder.encode("Admin@123"));
            userRepository.save(u1);

            User u2 = userRepository.findByEmail("admin2@ttth.vn").orElse(null);
            if (u2 == null) {
                u2 = new User();
                u2.setEmail("admin2@ttth.vn");
                u2.setFullName("Nguyễn Quản Trị");
                u2.setPhone("0900000002");
                u2.setRole(Role.ADMIN);
                u2.setActive(true);
            }
            u2.setPassword(passwordEncoder.encode("Admin@123"));
            userRepository.save(u2);

            User u3 = userRepository.findByEmail("admin3@ttth.vn").orElse(null);
            if (u3 == null) {
                u3 = new User();
                u3.setEmail("admin3@ttth.vn");
                u3.setFullName("Trần Hệ Thống");
                u3.setPhone("0900000003");
                u3.setRole(Role.ADMIN);
                u3.setActive(true);
            }
            u3.setPassword(passwordEncoder.encode("Admin@123"));
            userRepository.save(u3);

            return ResponseEntity.ok("Successfully reset admin/admin2/admin3 passwords to Admin@123!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}