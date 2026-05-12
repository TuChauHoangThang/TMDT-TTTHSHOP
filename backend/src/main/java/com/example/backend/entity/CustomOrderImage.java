package com.example.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "custom_order_images")
public class CustomOrderImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id", nullable = false)
    private CustomOrderRequest request;

    @Column(name = "image_url", columnDefinition = "TEXT", nullable = false)
    private String imageUrl;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CustomOrderRequest getRequest() { return request; }
    public void setRequest(CustomOrderRequest request) { this.request = request; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
