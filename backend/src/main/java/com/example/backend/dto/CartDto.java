package com.example.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartDto {

    public static class AddToCartRequest {
        private Long productId;
        private int quantity;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }

    public static class UpdateCartRequest {
        private int quantity;

        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
    }

    public static class CartItemResponse {
        private Long id; // CartItem ID
        private Long productId;
        private String productName;
        private String productSlug;
        private String productImage;
        private BigDecimal price;
        private int quantity;
        private BigDecimal totalLinePrice;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public String getProductSlug() { return productSlug; }
        public void setProductSlug(String productSlug) { this.productSlug = productSlug; }
        public String getProductImage() { return productImage; }
        public void setProductImage(String productImage) { this.productImage = productImage; }
        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }
        public int getQuantity() { return quantity; }
        public void setQuantity(int quantity) { this.quantity = quantity; }
        public BigDecimal getTotalLinePrice() { return totalLinePrice; }
        public void setTotalLinePrice(BigDecimal totalLinePrice) { this.totalLinePrice = totalLinePrice; }
    }
    
    public static class CartResponse {
        private List<CartItemResponse> items;
        private BigDecimal cartTotal;

        public List<CartItemResponse> getItems() { return items; }
        public void setItems(List<CartItemResponse> items) { this.items = items; }
        public BigDecimal getCartTotal() { return cartTotal; }
        public void setCartTotal(BigDecimal cartTotal) { this.cartTotal = cartTotal; }
    }
}
