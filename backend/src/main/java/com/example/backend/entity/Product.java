package com.example.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Sản phẩm nội thất
 */
@Entity
@Table(name = "products")
public class Product {

    public enum Status {
        ACTIVE,   // Đang bán
        INACTIVE  // Tạm ẩn
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String name;

    /**
     * Slug dùng trong URL, ví dụ: "sf001-sofa-go-oc-cho"
     */
    @Column(nullable = false, unique = true, length = 200)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    /**
     * Giá hiện tại (VNĐ). NULL nếu price_contact = true
     */
    @Column(name = "price_current", precision = 15, scale = 2)
    private BigDecimal priceCurrent;

    /**
     * Giá gốc (trước giảm). NULL nếu không có khuyến mãi
     */
    @Column(name = "price_original", precision = 15, scale = 2)
    private BigDecimal priceOriginal;

    /**
     * true = "Liên hệ để biết giá"
     */
    @Column(name = "price_contact", nullable = false)
    private Boolean priceContact = false;

    @Column(name = "rating_stars", precision = 2, scale = 1)
    private BigDecimal ratingStars;

    @Column(name = "rating_count")
    private Integer ratingCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    private Status status = Status.ACTIVE;

    @Column(name = "stock")
    private Integer stock = 20;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC, id ASC")
    private List<ProductImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ProductBadge> badges = new ArrayList<>();

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

    // ── Helper: lấy URL ảnh đại diện ──
    @Transient
    @JsonIgnore
    public String getPrimaryImageUrl() {
        if (images == null || images.isEmpty()) return null;
        return images.stream()
                .filter(ProductImage::isPrimary)
                .findFirst()
                .map(ProductImage::getImageUrl)
                .orElse(images.get(0).getImageUrl());
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public BigDecimal getPriceCurrent() { return priceCurrent; }
    public void setPriceCurrent(BigDecimal priceCurrent) { this.priceCurrent = priceCurrent; }
    public BigDecimal getPriceOriginal() { return priceOriginal; }
    public void setPriceOriginal(BigDecimal priceOriginal) { this.priceOriginal = priceOriginal; }
    public Boolean getPriceContact() { return priceContact; }
    public void setPriceContact(Boolean priceContact) { this.priceContact = priceContact; }
    public BigDecimal getRatingStars() { return ratingStars; }
    public void setRatingStars(BigDecimal ratingStars) { this.ratingStars = ratingStars; }
    public Integer getRatingCount() { return ratingCount; }
    public void setRatingCount(Integer ratingCount) { this.ratingCount = ratingCount; }
    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }
    public List<ProductImage> getImages() { return images; }
    public void setImages(List<ProductImage> images) { this.images = images; }
    public List<ProductBadge> getBadges() { return badges; }
    public void setBadges(List<ProductBadge> badges) { this.badges = badges; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
