package com.example.backend.controller;

import com.example.backend.entity.Shop;
import com.example.backend.repository.ShopRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/shops")
@CrossOrigin(origins = "http://localhost:5173")
public class ShopController {

    @Autowired
    private ShopRepository shopRepository;

    @GetMapping("/my-shop")
    public ResponseEntity<?> getMyShop(@RequestHeader("X-Contractor-Id") Long contractorId) {
        Optional<Shop> shopOpt = shopRepository.findByOwnerId(contractorId);
        if (shopOpt.isPresent()) {
            return ResponseEntity.ok(shopOpt.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/my-shop")
    public ResponseEntity<?> updateMyShop(
            @RequestHeader("X-Contractor-Id") Long contractorId,
            @RequestBody Shop updateData) {
        
        Optional<Shop> shopOpt = shopRepository.findByOwnerId(contractorId);
        Shop shop;
        
        if (shopOpt.isPresent()) {
            shop = shopOpt.get();
        } else {
            // Nếu chưa có shop thì báo lỗi, vì thông thường phải tạo lúc đăng ký
            // Hoặc tạo mới nếu hệ thống cho phép
            return ResponseEntity.badRequest().body(Map.of("error", "Shop not found for this contractor"));
        }

        if (updateData.getName() != null) shop.setName(updateData.getName());
        if (updateData.getDescription() != null) shop.setDescription(updateData.getDescription());
        if (updateData.getAddress() != null) shop.setAddress(updateData.getAddress());
        // Không cho phép update slug dễ dàng để tránh lỗi URL
        // if (updateData.getSlug() != null) shop.setSlug(updateData.getSlug());

        Shop savedShop = shopRepository.save(shop);
        return ResponseEntity.ok(savedShop);
    }
}
