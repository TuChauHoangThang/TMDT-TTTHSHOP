package com.example.backend.controller;

import com.example.backend.config.VNPayConfig;
import com.example.backend.dto.OrderRequestDTO;
import com.example.backend.entity.Order;
import com.example.backend.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private VNPayConfig vnpayConfig;

    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestHeader(value = "X-Customer-Id", required = false) String customerId,
            @RequestBody OrderRequestDTO requestDTO,
            HttpServletRequest request) {
        
        if (customerId == null || customerId.isEmpty()) {
            return ResponseEntity.badRequest().body("Customer ID is missing");
        }

        try {
            Order order = orderService.createOrder(customerId, requestDTO);
            String paymentUrl = null;

            if ("VNPAY".equalsIgnoreCase(order.getPaymentMethod())) {
                Map<String, String> vnp_Params = new HashMap<>();
                vnp_Params.put("vnp_Version", "2.1.0");
                vnp_Params.put("vnp_Command", "pay");
                vnp_Params.put("vnp_TmnCode", vnpayConfig.getTmnCode());
                vnp_Params.put("vnp_Amount", String.valueOf(order.getTotalAmount().multiply(new java.math.BigDecimal(100)).longValue()));
                vnp_Params.put("vnp_CurrCode", "VND");
                vnp_Params.put("vnp_TxnRef", String.valueOf(order.getId()));
                vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang " + order.getId());
                vnp_Params.put("vnp_OrderType", "other");
                vnp_Params.put("vnp_Locale", "vn");
                vnp_Params.put("vnp_ReturnUrl", vnpayConfig.getReturnUrl());
                vnp_Params.put("vnp_IpAddr", VNPayConfig.getIpAddress(request));

                Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
                SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
                String vnp_CreateDate = formatter.format(cld.getTime());
                vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

                List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
                Collections.sort(fieldNames);
                StringBuilder hashData = new StringBuilder();
                StringBuilder query = new StringBuilder();
                for (String fieldName : fieldNames) {
                    String fieldValue = vnp_Params.get(fieldName);
                    if ((fieldValue != null) && (fieldValue.length() > 0)) {
                        String encodedName = URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString());
                        String encodedValue = URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString());

                        if (hashData.length() > 0) {
                            hashData.append('&');
                        }
                        hashData.append(fieldName).append('=').append(encodedValue);

                        if (query.length() > 0) {
                            query.append('&');
                        }
                        query.append(encodedName).append('=').append(encodedValue);
                    }
                }
                String queryUrl = query.toString();
                String vnp_SecureHash = VNPayConfig.hmacSHA512(vnpayConfig.getHashSecret(), hashData.toString());
                paymentUrl = vnpayConfig.getVnpUrl() + "?" + queryUrl + "&vnp_SecureHash=" + vnp_SecureHash;
            }

            Map<String, Object> result = new HashMap<>();
            result.put("order", order);
            if (paymentUrl != null) {
                result.put("paymentUrl", paymentUrl);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getOrders(@RequestHeader(value = "X-Customer-Id", required = false) String customerId) {
        if (customerId == null || customerId.isEmpty()) {
            return ResponseEntity.badRequest().body("Customer ID is missing");
        }
        try {
            return ResponseEntity.ok(orderService.getOrdersByCustomer(customerId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(
            @PathVariable Long id,
            @RequestHeader(value = "X-Customer-Id", required = false) String customerId) {
        if (customerId == null || customerId.isEmpty()) {
            return ResponseEntity.badRequest().body("Customer ID is missing");
        }
        try {
            return ResponseEntity.ok(orderService.getOrderById(id, customerId));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}
