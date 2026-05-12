package com.example.backend.dto;

import com.example.backend.entity.Category;
import com.example.backend.entity.Product;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

/**
 * DTOs cho Sản Phẩm và Danh Mục
 */
public class ProductDto {

    // ==================== CATEGORY DTOs ====================

    /**
     * Response cho danh mục
     */
    public static class CategoryResponse {
        private Long id;
        private String name;
        private String slug;
        private String icon;
        private String imageUrl;
        private String description;
        private long productCount;
        private LocalDateTime createdAt;

        public static CategoryResponse from(Category c, long productCount) {
            CategoryResponse r = new CategoryResponse();
            r.id = c.getId();
            r.name = c.getName();
            r.slug = c.getSlug();
            r.icon = c.getIcon();
            r.imageUrl = c.getImageUrl();
            r.description = c.getDescription();
            r.productCount = productCount;
            r.createdAt = c.getCreatedAt();
            return r;
        }

        // Getters
        public Long getId() { return id; }
        public String getName() { return name; }
        public String getSlug() { return slug; }
        public String getIcon() { return icon; }
        public String getImageUrl() { return imageUrl; }
        public String getDescription() { return description; }
        public long getProductCount() { return productCount; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }

    /**
     * Request tạo/cập nhật danh mục (Admin)
     */
    public static class CategoryRequest {
        @NotBlank(message = "Tên danh mục không được để trống")
        @Size(max = 255)
        private String name;

        @NotBlank(message = "Slug không được để trống")
        @Size(max = 100)
        @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug chỉ gồm chữ thường, số và dấu gạch ngang")
        private String slug;

        private String icon;
        private String imageUrl;
        private String description;

        // Getters & Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getSlug() { return slug; }
        public void setSlug(String slug) { this.slug = slug; }
        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }

    // ==================== PRODUCT DTOs ====================

    /**
     * Tóm tắt sản phẩm — dùng trong danh sách và trang chủ
     */
    public static class ProductSummary {
        private Long id;
        private String name;
        private String slug;
        private String categoryName;
        private String categorySlug;
        private String image;           // Ảnh đại diện
        private BigDecimal priceCurrent;
        private BigDecimal priceOriginal;
        private Boolean priceContact;
        private BigDecimal ratingStars;
        private Integer ratingCount;
        private List<String> badges;
        private String status;
        private LocalDateTime createdAt;

        public static ProductSummary from(Product p) {
            ProductSummary s = new ProductSummary();
            s.id = p.getId();
            s.name = p.getName();
            s.slug = p.getSlug();
            s.categoryName = p.getCategory() != null ? p.getCategory().getName() : null;
            s.categorySlug = p.getCategory() != null ? p.getCategory().getSlug() : null;
            s.image = p.getPrimaryImageUrl();
            s.priceCurrent = p.getPriceCurrent();
            s.priceOriginal = p.getPriceOriginal();
            s.priceContact = p.getPriceContact();
            s.ratingStars = p.getRatingStars();
            s.ratingCount = p.getRatingCount();
            s.badges = p.getBadges() != null
                    ? p.getBadges().stream().map(b -> b.getBadgeLabel()).toList()
                    : Collections.emptyList();
            s.status = p.getStatus().name();
            s.createdAt = p.getCreatedAt();
            return s;
        }

        // Getters
        public Long getId() { return id; }
        public String getName() { return name; }
        public String getSlug() { return slug; }
        public String getCategoryName() { return categoryName; }
        public String getCategorySlug() { return categorySlug; }
        public String getImage() { return image; }
        public BigDecimal getPriceCurrent() { return priceCurrent; }
        public BigDecimal getPriceOriginal() { return priceOriginal; }
        public Boolean getPriceContact() { return priceContact; }
        public BigDecimal getRatingStars() { return ratingStars; }
        public Integer getRatingCount() { return ratingCount; }
        public List<String> getBadges() { return badges; }
        public String getStatus() { return status; }
        public LocalDateTime getCreatedAt() { return createdAt; }
    }

    /**
     * Chi tiết sản phẩm — dùng trong trang chi tiết
     */
    public static class ProductDetail {
        private Long id;
        private String name;
        private String slug;
        private String description;
        private String categoryName;
        private String categorySlug;
        private List<String> images;    // Tất cả ảnh
        private BigDecimal priceCurrent;
        private BigDecimal priceOriginal;
        private Boolean priceContact;
        private BigDecimal ratingStars;
        private Integer ratingCount;
        private List<String> badges;
        private String status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static ProductDetail from(Product p) {
            ProductDetail d = new ProductDetail();
            d.id = p.getId();
            d.name = p.getName();
            d.slug = p.getSlug();
            d.description = p.getDescription();
            d.categoryName = p.getCategory() != null ? p.getCategory().getName() : null;
            d.categorySlug = p.getCategory() != null ? p.getCategory().getSlug() : null;
            d.images = p.getImages() != null
                    ? p.getImages().stream().map(img -> img.getImageUrl()).toList()
                    : Collections.emptyList();
            d.priceCurrent = p.getPriceCurrent();
            d.priceOriginal = p.getPriceOriginal();
            d.priceContact = p.getPriceContact();
            d.ratingStars = p.getRatingStars();
            d.ratingCount = p.getRatingCount();
            d.badges = p.getBadges() != null
                    ? p.getBadges().stream().map(b -> b.getBadgeLabel()).toList()
                    : Collections.emptyList();
            d.status = p.getStatus().name();
            d.createdAt = p.getCreatedAt();
            d.updatedAt = p.getUpdatedAt();
            return d;
        }

        // Getters
        public Long getId() { return id; }
        public String getName() { return name; }
        public String getSlug() { return slug; }
        public String getDescription() { return description; }
        public String getCategoryName() { return categoryName; }
        public String getCategorySlug() { return categorySlug; }
        public List<String> getImages() { return images; }
        public BigDecimal getPriceCurrent() { return priceCurrent; }
        public BigDecimal getPriceOriginal() { return priceOriginal; }
        public Boolean getPriceContact() { return priceContact; }
        public BigDecimal getRatingStars() { return ratingStars; }
        public Integer getRatingCount() { return ratingCount; }
        public List<String> getBadges() { return badges; }
        public String getStatus() { return status; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
    }

    /**
     * Request tạo mới sản phẩm (Admin)
     */
    public static class CreateProductRequest {

        @NotBlank(message = "Tên sản phẩm không được để trống")
        @Size(max = 500, message = "Tên tối đa 500 ký tự")
        private String name;

        @NotBlank(message = "Slug không được để trống")
        @Size(max = 200)
        @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug chỉ gồm chữ thường, số và dấu gạch ngang")
        private String slug;

        private String description;

        @NotNull(message = "Danh mục không được để trống")
        private Long categoryId;

        private BigDecimal priceCurrent;
        private BigDecimal priceOriginal;
        private Boolean priceContact = false;

        @DecimalMin(value = "1.0") @DecimalMax(value = "5.0")
        private BigDecimal ratingStars;
        private Integer ratingCount;

        /** Danh sách URL ảnh (ảnh đầu tiên là ảnh đại diện) */
        private List<String> imageUrls;

        /** Danh sách badge: ["HOT", "MỚI", "-15%"] */
        private List<String> badges;

        // Getters & Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getSlug() { return slug; }
        public void setSlug(String slug) { this.slug = slug; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
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
        public List<String> getImageUrls() { return imageUrls; }
        public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
        public List<String> getBadges() { return badges; }
        public void setBadges(List<String> badges) { this.badges = badges; }
    }

    /**
     * Request cập nhật sản phẩm (Admin) — các field đều optional
     */
    public static class UpdateProductRequest {
        @Size(max = 500)
        private String name;

        private String description;
        private Long categoryId;
        private BigDecimal priceCurrent;
        private BigDecimal priceOriginal;
        private Boolean priceContact;

        @DecimalMin(value = "1.0") @DecimalMax(value = "5.0")
        private BigDecimal ratingStars;
        private Integer ratingCount;
        private List<String> imageUrls;
        private List<String> badges;
        private String status; // "ACTIVE" hoặc "INACTIVE"

        // Getters & Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
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
        public List<String> getImageUrls() { return imageUrls; }
        public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
        public List<String> getBadges() { return badges; }
        public void setBadges(List<String> badges) { this.badges = badges; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    // ==================== PAGED RESPONSE ====================

    /**
     * Wrapper response cho danh sách sản phẩm có phân trang
     */
    public static class PagedProductResponse {
        private List<ProductSummary> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean last;

        public static PagedProductResponse from(org.springframework.data.domain.Page<ProductSummary> page) {
            PagedProductResponse r = new PagedProductResponse();
            r.content = page.getContent();
            r.page = page.getNumber();
            r.size = page.getSize();
            r.totalElements = page.getTotalElements();
            r.totalPages = page.getTotalPages();
            r.last = page.isLast();
            return r;
        }

        // Getters
        public List<ProductSummary> getContent() { return content; }
        public int getPage() { return page; }
        public int getSize() { return size; }
        public long getTotalElements() { return totalElements; }
        public int getTotalPages() { return totalPages; }
        public boolean isLast() { return last; }
    }
}
