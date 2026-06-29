package com.example.backend.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;

// ==================== REQUEST DTOs ====================

public class CustomOrderDto {

    /** Customer tạo yêu cầu đặt hàng */
    public static class CreateRequest {
        @NotBlank(message = "Tiêu đề không được để trống")
        @Size(max = 500, message = "Tiêu đề tối đa 500 ký tự")
        private String title;

        @NotBlank(message = "Mô tả không được để trống")
        private String description;

        @NotBlank(message = "Loại nội thất không được để trống")
        private String furnitureType;

        private String material;
        private String dimensions;
        private String colorStyle;

        @NotNull(message = "Ngân sách tối thiểu không được để trống")
        @DecimalMin(value = "0", message = "Ngân sách không hợp lệ")
        private BigDecimal budgetMin;

        @NotNull(message = "Ngân sách tối đa không được để trống")
        @DecimalMin(value = "0", message = "Ngân sách không hợp lệ")
        private BigDecimal budgetMax;

        @NotNull(message = "Thời hạn không được để trống")
        @Future(message = "Thời hạn phải là ngày trong tương lai")
        private LocalDate deadline;

        // Getters & Setters
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
    }

    /** Contractor gửi báo giá */
    public static class SubmitQuote {
        @NotNull(message = "Giá báo không được để trống")
        @DecimalMin(value = "1000", message = "Giá báo tối thiểu 1,000đ")
        private BigDecimal quotedPrice;

        @NotNull(message = "Số ngày hoàn thành không được để trống")
        @Min(value = 1, message = "Số ngày tối thiểu là 1")
        @Max(value = 365, message = "Số ngày tối đa là 365")
        private Integer estimatedDays;

        @NotBlank(message = "Vui lòng thêm mô tả về giải pháp của bạn")
        @Size(max = 2000, message = "Ghi chú tối đa 2000 ký tự")
        private String note;

        private java.util.List<String> imageUrls; // Contractor đính kèm ảnh mẫu

        // Getters & Setters
        public BigDecimal getQuotedPrice() { return quotedPrice; }
        public void setQuotedPrice(BigDecimal quotedPrice) { this.quotedPrice = quotedPrice; }
        public Integer getEstimatedDays() { return estimatedDays; }
        public void setEstimatedDays(Integer estimatedDays) { this.estimatedDays = estimatedDays; }
        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
        public java.util.List<String> getImageUrls() { return imageUrls; }
        public void setImageUrls(java.util.List<String> urls) { this.imageUrls = urls; }
    }

    // ==================== RESPONSE DTOs ====================

    public static class QuoteResponse {
        private Long id;
        private Long requestId;
        private Long contractorId;
        private String contractorName;
        private String contractorPhone;
        private Long shopId;
        private String shopName;
        private String shopSlug;
        private String shopAddress;
        private String shopLogo;
        private Double shopRating;
        private java.math.BigDecimal quotedPrice;
        private Integer estimatedDays;
        private String note;
        private java.util.List<String> imageUrls;
        private String status;
        private java.time.LocalDateTime createdAt;

        public static QuoteResponse from(com.example.backend.entity.CustomOrderQuote q) {
            QuoteResponse r = new QuoteResponse();
            r.id = q.getId();
            if (q.getRequest() != null) {
                r.requestId = q.getRequest().getId();
            }
            r.contractorId = q.getContractorId();
            r.shopId = q.getShopId();
            r.quotedPrice = q.getQuotedPrice();
            r.estimatedDays = q.getEstimatedDays();
            r.note = q.getNote();
            if (q.getImageUrls() != null && !q.getImageUrls().isBlank()) {
                r.imageUrls = java.util.Arrays.asList(q.getImageUrls().split(","));
            } else {
                r.imageUrls = java.util.Collections.emptyList();
            }
            r.status = q.getStatus().name();
            r.createdAt = q.getCreatedAt();
            return r;
        }

        public Long getId() { return id; }
        public Long getRequestId() { return requestId; }
        public Long getContractorId() { return contractorId; }
        public String getContractorName() { return contractorName; }
        public void setContractorName(String n) { this.contractorName = n; }
        public String getContractorPhone() { return contractorPhone; }
        public void setContractorPhone(String p) { this.contractorPhone = p; }
        public Long getShopId() { return shopId; }
        public String getShopName() { return shopName; }
        public void setShopName(String s) { this.shopName = s; }
        public String getShopSlug() { return shopSlug; }
        public void setShopSlug(String s) { this.shopSlug = s; }
        public String getShopAddress() { return shopAddress; }
        public void setShopAddress(String a) { this.shopAddress = a; }
        public String getShopLogo() { return shopLogo; }
        public void setShopLogo(String l) { this.shopLogo = l; }
        public Double getShopRating() { return shopRating; }
        public void setShopRating(Double r) { this.shopRating = r; }
        public java.math.BigDecimal getQuotedPrice() { return quotedPrice; }
        public Integer getEstimatedDays() { return estimatedDays; }
        public String getNote() { return note; }
        public java.util.List<String> getImageUrls() { return imageUrls; }
        public String getStatus() { return status; }
        public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    }

    public static class RequestResponse {
        private Long id;
        private Long customerId;
        private String customerName;
        private String customerPhone;
        private String title;
        private String description;
        private String furnitureType;
        private String material;
        private String dimensions;
        private String colorStyle;
        private java.math.BigDecimal budgetMin;
        private java.math.BigDecimal budgetMax;
        private java.time.LocalDate deadline;
        private String status;
        private Long selectedQuoteId;
        private java.util.List<String> imageUrls;
        private java.util.List<QuoteResponse> quotes;
        private int quoteCount;
        private java.time.LocalDateTime createdAt;
        private java.time.LocalDateTime updatedAt;

        public static RequestResponse from(com.example.backend.entity.CustomOrderRequest r, boolean includeQuotes) {
            RequestResponse resp = new RequestResponse();
            resp.id = r.getId();
            resp.customerId = r.getCustomerId();
            resp.title = r.getTitle();
            resp.description = r.getDescription();
            resp.furnitureType = r.getFurnitureType();
            resp.material = r.getMaterial();
            resp.dimensions = r.getDimensions();
            resp.colorStyle = r.getColorStyle();
            resp.budgetMin = r.getBudgetMin();
            resp.budgetMax = r.getBudgetMax();
            resp.deadline = r.getDeadline();
            resp.status = r.getStatus().name();
            resp.selectedQuoteId = r.getSelectedQuoteId();
            resp.imageUrls = r.getImages().stream().map(img -> img.getImageUrl()).toList();
            resp.quotes = includeQuotes
                ? r.getQuotes().stream().map(QuoteResponse::from).toList()
                : java.util.Collections.emptyList();
            resp.quoteCount = r.getQuotes() != null ? r.getQuotes().size() : 0;
            resp.createdAt = r.getCreatedAt();
            resp.updatedAt = r.getUpdatedAt();
            return resp;
        }

        // Getters & Setters
        public Long getId() { return id; }
        public Long getCustomerId() { return customerId; }
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String name) { this.customerName = name; }
        public String getCustomerPhone() { return customerPhone; }
        public void setCustomerPhone(String phone) { this.customerPhone = phone; }
        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public String getFurnitureType() { return furnitureType; }
        public String getMaterial() { return material; }
        public String getDimensions() { return dimensions; }
        public String getColorStyle() { return colorStyle; }
        public java.math.BigDecimal getBudgetMin() { return budgetMin; }
        public java.math.BigDecimal getBudgetMax() { return budgetMax; }
        public java.time.LocalDate getDeadline() { return deadline; }
        public String getStatus() { return status; }
        public Long getSelectedQuoteId() { return selectedQuoteId; }
        public java.util.List<String> getImageUrls() { return imageUrls; }
        public java.util.List<QuoteResponse> getQuotes() { return quotes; }
        public int getQuoteCount() { return quoteCount; }
        public java.time.LocalDateTime getCreatedAt() { return createdAt; }
        public java.time.LocalDateTime getUpdatedAt() { return updatedAt; }
    }
}
