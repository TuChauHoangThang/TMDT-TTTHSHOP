package com.example.backend.entity;

import jakarta.persistence.*;

/**
 * Nhãn badge của sản phẩm: HOT, MỚI, -15%, BESTSELLER, ...
 */
@Entity
@Table(name = "product_badges")
public class ProductBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /**
     * Nhãn hiển thị, ví dụ: "HOT", "MỚI", "-15%"
     */
    @Column(name = "badge_label", nullable = false, length = 50)
    private String badgeLabel;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getBadgeLabel() { return badgeLabel; }
    public void setBadgeLabel(String badgeLabel) { this.badgeLabel = badgeLabel; }
}
