package com.example.backend.dto;

import java.math.BigDecimal;

public class TopPartnerDto {
    private Long id;
    private String fullName;
    private String email;
    private Long transactionCount;
    private BigDecimal totalAmount;

    public TopPartnerDto(Long id, String fullName, String email, Long transactionCount, BigDecimal totalAmount) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.transactionCount = transactionCount;
        this.totalAmount = totalAmount;
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public Long getTransactionCount() { return transactionCount; }
    public BigDecimal getTotalAmount() { return totalAmount; }
}