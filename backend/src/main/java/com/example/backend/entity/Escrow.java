package com.example.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "escrows")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Escrow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "request_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"quotes", "images", "selectedQuoteId"})
    private CustomOrderRequest request;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"password", "provider", "providerId"})
    private User customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "contractor_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"password", "provider", "providerId"})
    private User contractor;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EscrowStatus status = EscrowStatus.PENDING;

    @Column(name = "payment_method")
    private String paymentMethod; // VNPAY, MOCK

    @Column(name = "dispute_reason", columnDefinition = "TEXT")
    private String disputeReason;

    @Column(name = "dispute_resolution", columnDefinition = "TEXT")
    private String disputeResolution;

    /** Tỷ lệ hoa hồng (mặc định 5%) */
    @Column(name = "commission_rate", precision = 5, scale = 4)
    private BigDecimal commissionRate = new BigDecimal("0.05");

    /** Số tiền hoa hồng platform thu (= amount * commissionRate) */
    @Column(name = "commission_amount", precision = 15, scale = 2)
    private BigDecimal commissionAmount = BigDecimal.ZERO;

    /** Số tiền nhà thầu thực nhận sau khi trừ hoa hồng */
    @Column(name = "net_amount", precision = 15, scale = 2)
    private BigDecimal netAmount = BigDecimal.ZERO;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "released_at")
    private LocalDateTime releasedAt;

    @Column(name = "refunded_at")
    private LocalDateTime refundedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public CustomOrderRequest getRequest() { return request; }
    public void setRequest(CustomOrderRequest request) { this.request = request; }

    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }

    public User getContractor() { return contractor; }
    public void setContractor(User contractor) { this.contractor = contractor; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public EscrowStatus getStatus() { return status; }
    public void setStatus(EscrowStatus status) { this.status = status; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getDisputeReason() { return disputeReason; }
    public void setDisputeReason(String disputeReason) { this.disputeReason = disputeReason; }

    public String getDisputeResolution() { return disputeResolution; }
    public void setDisputeResolution(String disputeResolution) { this.disputeResolution = disputeResolution; }

    public BigDecimal getCommissionRate() { return commissionRate; }
    public void setCommissionRate(BigDecimal commissionRate) { this.commissionRate = commissionRate; }

    public BigDecimal getCommissionAmount() { return commissionAmount; }
    public void setCommissionAmount(BigDecimal commissionAmount) { this.commissionAmount = commissionAmount; }

    public BigDecimal getNetAmount() { return netAmount; }
    public void setNetAmount(BigDecimal netAmount) { this.netAmount = netAmount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getReleasedAt() { return releasedAt; }
    public void setReleasedAt(LocalDateTime releasedAt) { this.releasedAt = releasedAt; }

    public LocalDateTime getRefundedAt() { return refundedAt; }
    public void setRefundedAt(LocalDateTime refundedAt) { this.refundedAt = refundedAt; }
}
