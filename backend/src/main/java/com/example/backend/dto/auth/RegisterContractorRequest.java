package com.example.backend.dto.auth;

import lombok.Data;

@Data
public class RegisterContractorRequest {
    private String fullName;
    private String email;
    private String phone;
    private String password;
    private String shopName;
    private String shopDescription;
    private String shopAddress;

    // Getters & Setters
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }
    public String getShopDescription() { return shopDescription; }
    public void setShopDescription(String shopDescription) { this.shopDescription = shopDescription; }
    public String getShopAddress() { return shopAddress; }
    public void setShopAddress(String shopAddress) { this.shopAddress = shopAddress; }
}
