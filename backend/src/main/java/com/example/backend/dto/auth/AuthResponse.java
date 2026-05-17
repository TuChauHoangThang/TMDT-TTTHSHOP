package com.example.backend.dto.auth;

public class AuthResponse {
    private String token;
    private UserResponse user;

    public AuthResponse() {}

    public AuthResponse(String token, UserResponse user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public UserResponse getUser() { return user; }
    public void setUser(UserResponse user) { this.user = user; }

    public static class UserResponse {
        private Long id;
        private String fullName;
        private String email;
        private String role;
        private Long shopId; // Thêm shopId cho nhà thầu

        public UserResponse() {}

        public UserResponse(Long id, String fullName, String email, String role, Long shopId) {
            this.id = id;
            this.fullName = fullName;
            this.email = email;
            this.role = role;
            this.shopId = shopId;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public Long getShopId() { return shopId; }
        public void setShopId(Long id) { this.shopId = id; }
    }
}