package com.example.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Báo giá từ nhà thầu (Contractor) cho một yêu cầu đặt hàng
 */
@Entity
@Table(name = "custom_order_quotes")
public class CustomOrderQuote {

    public enum Status {
        PENDING,    // Chờ khách hàng xem xét
        ACCEPTED,   // Được chọn
        REJECTED,   // Bị từ chối
        WITHDRAWN   // Nhà thầu tự rút báo giá
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private CustomOrderRequest request;

    @Column(name = "contractor_id", nullable = false)
    private Long contractorId;

    @Column(name = "shop_id", nullable = false)
    private Long shopId;

    @Column(name = "quoted_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal quotedPrice;

    @Column(name = "estimated_days", nullable = false)
    private Integer estimatedDays;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "image_urls", columnDefinition = "TEXT")
    private String imageUrls; // Lưu dưới dạng JSON string hoặc comma-separated

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Status status = Status.PENDING;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CustomOrderRequest getRequest() { return request; }
    public void setRequest(CustomOrderRequest request) { this.request = request; }
    public Long getContractorId() { return contractorId; }
    public void setContractorId(Long contractorId) { this.contractorId = contractorId; }
    public Long getShopId() { return shopId; }
    public void setShopId(Long shopId) { this.shopId = shopId; }
    public BigDecimal getQuotedPrice() { return quotedPrice; }
    public void setQuotedPrice(BigDecimal quotedPrice) { this.quotedPrice = quotedPrice; }
    public Integer getEstimatedDays() { return estimatedDays; }
    public void setEstimatedDays(Integer estimatedDays) { this.estimatedDays = estimatedDays; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getImageUrls() { return imageUrls; }
    public void setImageUrls(String imageUrls) { this.imageUrls = imageUrls; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
