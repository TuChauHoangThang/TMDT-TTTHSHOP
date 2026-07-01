package com.example.backend.controller;

import com.example.backend.dto.ProductDto;
import com.example.backend.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /**
     * Lấy danh sách sản phẩm (có tìm kiếm và phân trang)
     */
    @GetMapping
    public ResponseEntity<ProductDto.PagedProductResponse> getProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(productService.getProducts(keyword, categorySlug, page, size));
    }

    /**
     * Lấy danh sách sản phẩm nổi bật (trang chủ)
     */
    @GetMapping("/featured")
    public ResponseEntity<List<ProductDto.ProductSummary>> getFeaturedProducts(
            @RequestParam(defaultValue = "4") int limit) {
        return ResponseEntity.ok(productService.getFeaturedProducts(limit));
    }

    /**
     * Gợi ý tìm kiếm (autocomplete)
     */
    @GetMapping("/suggestions")
    public ResponseEntity<List<ProductDto.ProductSummary>> getSuggestions(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(productService.getSuggestions(keyword, limit));
    }

    /**
     * Chi tiết sản phẩm theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(productService.getProductById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Chi tiết sản phẩm theo slug
     */
    @GetMapping("/slug/{slug}")
    public ResponseEntity<?> getProductBySlug(@PathVariable String slug) {
        try {
            return ResponseEntity.ok(productService.getProductBySlug(slug));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Lấy danh sách sản phẩm của Seller (có phân trang)
     */
    @GetMapping("/seller")
    public ResponseEntity<?> getSellerProducts(
            @RequestHeader("X-Contractor-Id") Long contractorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        try {
            return ResponseEntity.ok(productService.getProductsByShop(contractorId, page, size));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Tạo sản phẩm mới (Admin / Seller)
     */
    @PostMapping
    public ResponseEntity<?> createProduct(
            @RequestHeader(value = "X-Contractor-Id", required = false) Long contractorId,
            @Valid @RequestBody ProductDto.CreateProductRequest request) {
        try {
            return ResponseEntity.ok(productService.createProduct(request, contractorId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Cập nhật sản phẩm (Admin / Seller)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestHeader(value = "X-Contractor-Id", required = false) Long contractorId,
            @Valid @RequestBody ProductDto.UpdateProductRequest request) {
        try {
            return ResponseEntity.ok(productService.updateProduct(id, request, contractorId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Xóa sản phẩm (Soft delete - Admin / Seller)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable Long id,
            @RequestHeader(value = "X-Contractor-Id", required = false) Long contractorId) {
        try {
            productService.deleteProduct(id, contractorId);
            return ResponseEntity.ok(Map.of("message", "Đã xóa sản phẩm thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
