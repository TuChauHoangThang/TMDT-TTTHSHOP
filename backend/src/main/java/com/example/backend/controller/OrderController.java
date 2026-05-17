package com.example.backend.controller;

import com.example.backend.dto.OrderRequestDTO;
import com.example.backend.entity.Order;
import com.example.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestHeader(value = "X-Customer-Id", required = false) String customerId,
            @RequestBody OrderRequestDTO requestDTO) {
        
        if (customerId == null || customerId.isEmpty()) {
            return ResponseEntity.badRequest().body("Customer ID is missing");
        }

        try {
            Order order = orderService.createOrder(customerId, requestDTO);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
