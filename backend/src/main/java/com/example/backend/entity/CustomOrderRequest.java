package com.example.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Yêu cầu đặt hàng theo yêu cầu từ khách hàng (Custom Order RFQ)
 */
@Entity
@Table(name = "custom_order_requests")
public class CustomOrderRequest {

    public enum Status {
        OPEN,                    // Đang chờ báo giá
        QUOTED,                  // Đã nhận ít nhất 1 báo giá
        WAITING_FOR_PAYMENT,     // Khách hàng đã chọn báo giá, chờ thanh toán tạm giữ
        IN_PROGRESS,             // Tiền đã tạm giữ, đang thực hiện
        COMPLETED_BY_CONTRACTOR, // Nhà thầu đã hoàn thành và giao hàng, chờ khách xác nhận
        COMPLETED_BY_CUSTOMER,   // Khách đã xác nhận nhận hàng, chờ admin giải ngân
        COMPLETED,               // Admin đã giải ngân, hoàn thành
        DISPUTED,                // Đang có tranh chấp khiếu nại
        CANCELLED                // Đã hủy
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "furniture_type", length = 255)
    private String furnitureType;

    @Column(length = 255)
    private String material;

    @Column(length = 255)
    private String dimensions;

    @Column(name = "color_style", length = 255)
    private String colorStyle;

    @Column(name = "budget_min", precision = 15, scale = 2)
    private BigDecimal budgetMin;

    @Column(name = "budget_max", precision = 15, scale = 2)
    private BigDecimal budgetMax;

    @Column(name = "deadline")
    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Status status = Status.OPEN;

    @Column(name = "selected_quote_id")
    private Long selectedQuoteId;

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CustomOrderImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<CustomOrderQuote> quotes = new ArrayList<>();

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
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getFurnitureType() { return furnitureType; }
    public void setFurnitureType(String furnitureType) { this.furnitureType = furnitureType; }
    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }
    public String getDimensions() { return dimensions; }
    public void setDimensions(String dimensions) { this.dimensions = dimensions; }
    public String getColorStyle() { return colorStyle; }
    public void setColorStyle(String colorStyle) { this.colorStyle = colorStyle; }
    public BigDecimal getBudgetMin() { return budgetMin; }
    public void setBudgetMin(BigDecimal budgetMin) { this.budgetMin = budgetMin; }
    public BigDecimal getBudgetMax() { return budgetMax; }
    public void setBudgetMax(BigDecimal budgetMax) { this.budgetMax = budgetMax; }
    public LocalDate getDeadline() { return deadline; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Long getSelectedQuoteId() { return selectedQuoteId; }
    public void setSelectedQuoteId(Long selectedQuoteId) { this.selectedQuoteId = selectedQuoteId; }
    public List<CustomOrderImage> getImages() { return images; }
    public void setImages(List<CustomOrderImage> images) { this.images = images; }
    public List<CustomOrderQuote> getQuotes() { return quotes; }
    public void setQuotes(List<CustomOrderQuote> quotes) { this.quotes = quotes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
