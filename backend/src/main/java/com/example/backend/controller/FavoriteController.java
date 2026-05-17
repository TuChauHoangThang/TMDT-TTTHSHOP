package com.example.backend.controller;

import com.example.backend.dto.ProductDto;
import com.example.backend.entity.Product;
import com.example.backend.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "http://localhost:5173")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    @GetMapping
    public ResponseEntity<?> getFavorites(@RequestHeader(value = "X-Customer-Id", required = false) String customerId) {
        if (customerId == null || customerId.isEmpty()) {
            return ResponseEntity.badRequest().body("Customer ID is missing");
        }
        List<ProductDto.ProductSummary> favorites = favoriteService.getFavorites(customerId);
        return ResponseEntity.ok(favorites);
    }

    @PostMapping("/toggle/{productId}")
    public ResponseEntity<?> toggleFavorite(
            @RequestHeader(value = "X-Customer-Id", required = false) String customerId,
            @PathVariable Long productId) {
        if (customerId == null || customerId.isEmpty()) {
            return ResponseEntity.badRequest().body("Customer ID is missing");
        }
        try {
            favoriteService.toggleFavorite(customerId, productId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
