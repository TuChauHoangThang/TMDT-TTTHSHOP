package com.example.backend.controller;

import com.example.backend.dto.CartDto;
import com.example.backend.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5173")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    private String getCustomerId(String customerIdHeader) {
        if (customerIdHeader == null || customerIdHeader.isEmpty()) {
            throw new RuntimeException("Bạn cần đăng nhập để sử dụng giỏ hàng");
        }
        return customerIdHeader;
    }

    @GetMapping
    public ResponseEntity<?> getCart(@RequestHeader(value = "X-Customer-Id", required = false) String customerIdHeader) {
        try {
            String customerId = getCustomerId(customerIdHeader);
            return ResponseEntity.ok(cartService.getCart(customerId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/add")
    public ResponseEntity<?> addToCart(
            @RequestHeader(value = "X-Customer-Id", required = false) String customerIdHeader,
            @RequestBody CartDto.AddToCartRequest request) {
        try {
            String customerId = getCustomerId(customerIdHeader);
            cartService.addToCart(customerId, request);
            return ResponseEntity.ok(Map.of("message", "Đã thêm vào giỏ hàng"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/item/{itemId}")
    public ResponseEntity<?> updateCartItem(
            @RequestHeader(value = "X-Customer-Id", required = false) String customerIdHeader,
            @PathVariable Long itemId,
            @RequestBody CartDto.UpdateCartRequest request) {
        try {
            String customerId = getCustomerId(customerIdHeader);
            cartService.updateCartItem(customerId, itemId, request);
            return ResponseEntity.ok(Map.of("message", "Đã cập nhật giỏ hàng"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<?> removeCartItem(
            @RequestHeader(value = "X-Customer-Id", required = false) String customerIdHeader,
            @PathVariable Long itemId) {
        try {
            String customerId = getCustomerId(customerIdHeader);
            cartService.removeCartItem(customerId, itemId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa sản phẩm khỏi giỏ"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearCart(
            @RequestHeader(value = "X-Customer-Id", required = false) String customerIdHeader) {
        try {
            String customerId = getCustomerId(customerIdHeader);
            cartService.clearCart(customerId);
            return ResponseEntity.ok(Map.of("message", "Đã làm sạch giỏ hàng"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
