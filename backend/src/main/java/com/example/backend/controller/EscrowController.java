package com.example.backend.controller;

import com.example.backend.config.VNPayConfig;
import com.example.backend.entity.Escrow;
import com.example.backend.entity.CustomOrderRequest;
import com.example.backend.service.EscrowService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/escrows")
@CrossOrigin(origins = "http://localhost:5173")
public class EscrowController {

    @Autowired
    private EscrowService escrowService;

    @Autowired
    private VNPayConfig vnpayConfig;

    @GetMapping("/{requestId}")
    public ResponseEntity<?> getEscrow(@PathVariable Long requestId) {
        try {
            Escrow escrow = escrowService.getEscrowByRequestId(requestId);
            if (escrow == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(escrow);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{requestId}/deposit-mock")
    public ResponseEntity<?> depositMock(@PathVariable Long requestId) {
        try {
            Escrow escrow = escrowService.depositMock(requestId);
            return ResponseEntity.ok(escrow);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{requestId}/deposit-wallet")
    public ResponseEntity<?> depositWithWallet(
            @PathVariable Long requestId,
            @RequestHeader("X-Customer-Id") Long customerId) {
        try {
            Escrow escrow = escrowService.depositWithWallet(requestId, customerId);
            return ResponseEntity.ok(escrow);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{requestId}/vnpay-url")
    public ResponseEntity<?> getVNPayUrl(@PathVariable Long requestId, HttpServletRequest request) {
        try {
            Escrow escrow = escrowService.getEscrowByRequestId(requestId);
            if (escrow == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Không tìm thấy thông tin tạm giữ"));
            }

            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", "2.1.0");
            vnp_Params.put("vnp_Command", "pay");
            vnp_Params.put("vnp_TmnCode", vnpayConfig.getTmnCode());
            vnp_Params.put("vnp_Amount", String.valueOf(escrow.getAmount().multiply(new java.math.BigDecimal(100)).longValue()));
            vnp_Params.put("vnp_CurrCode", "VND");
            vnp_Params.put("vnp_TxnRef", "ESCROW_" + requestId);
            vnp_Params.put("vnp_OrderInfo", "Thanh toan tam giu Escrow cho yeu cau " + requestId);
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
            String paymentUrl = vnpayConfig.getVnpUrl() + "?" + queryUrl + "&vnp_SecureHash=" + vnp_SecureHash;

            return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{requestId}/ship")
    public ResponseEntity<?> markShipped(
            @PathVariable Long requestId,
            @RequestHeader("X-Contractor-Id") Long contractorId) {
        try {
            CustomOrderRequest req = escrowService.markShipped(requestId, contractorId);
            return ResponseEntity.ok(req);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{requestId}/release")
    public ResponseEntity<?> releaseEscrow(
            @PathVariable Long requestId,
            @RequestHeader("X-Customer-Id") Long customerId) {
        try {
            Escrow escrow = escrowService.releaseEscrow(requestId, customerId);
            return ResponseEntity.ok(escrow);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{requestId}/dispute")
    public ResponseEntity<?> disputeEscrow(
            @PathVariable Long requestId,
            @RequestHeader("X-Customer-Id") Long customerId,
            @RequestBody Map<String, String> body) {
        try {
            String reason = body.getOrDefault("reason", "Khách hàng khiếu nại chất lượng sản phẩm");
            Escrow escrow = escrowService.disputeEscrow(requestId, customerId, reason);
            return ResponseEntity.ok(escrow);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ================= ADMIN ENDPOINTS =================

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllEscrows() {
        try {
            return ResponseEntity.ok(escrowService.getAllEscrows());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/{escrowId}/resolve")
    public ResponseEntity<?> resolveDispute(
            @PathVariable Long escrowId,
            @RequestBody Map<String, String> body) {
        try {
            String resolution = body.get("resolution"); // RELEASE or REFUND
            String notes = body.getOrDefault("notes", "Admin xử lý tranh chấp");
            Escrow escrow = escrowService.resolveDispute(escrowId, resolution, notes);
            return ResponseEntity.ok(escrow);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
