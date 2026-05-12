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
     * Tạo sản phẩm mới (Admin)
     */
    @PostMapping
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductDto.CreateProductRequest request) {
        try {
            return ResponseEntity.ok(productService.createProduct(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Cập nhật sản phẩm (Admin)
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductDto.UpdateProductRequest request) {
        try {
            return ResponseEntity.ok(productService.updateProduct(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Xóa sản phẩm (Soft delete - Admin)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            productService.deleteProduct(id);
            return ResponseEntity.ok(Map.of("message", "Đã xóa sản phẩm thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
