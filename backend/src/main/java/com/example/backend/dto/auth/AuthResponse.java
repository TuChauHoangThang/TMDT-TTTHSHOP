package com.example.backend.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private UserResponse user; // Bọc thông tin user vào đây

    @Data
    @AllArgsConstructor
    public static class UserResponse {
        private Long id;
        private String fullName;
        private String email;
        private String role;
    }
}