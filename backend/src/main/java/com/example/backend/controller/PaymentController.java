package com.example.backend.controller;

import com.example.backend.config.VNPayConfig;
import com.example.backend.service.OrderService;
import com.example.backend.service.EscrowService;
import com.example.backend.service.WalletService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    @Autowired
    private VNPayConfig vnpayConfig;

    @Autowired
    private EscrowService escrowService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private WalletService walletService;

    @GetMapping("/vnpay-callback")
    public ResponseEntity<?> vnpayCallback(HttpServletRequest request) {
        try {
            Map<String, String> fields = new HashMap<>();
            for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements(); ) {
                String fieldName = params.nextElement();
                String fieldValue = request.getParameter(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    fields.put(fieldName, fieldValue);
                }
            }

            String vnp_SecureHash = request.getParameter("vnp_SecureHash");
            if (fields.containsKey("vnp_SecureHashType")) {
                fields.remove("vnp_SecureHashType");
            }
            if (fields.containsKey("vnp_SecureHash")) {
                fields.remove("vnp_SecureHash");
            }

            // Sắp xếp các tham số để tạo chuỗi băm kiểm tra
            List<String> fieldNames = new ArrayList<>(fields.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            for (String fieldName : fieldNames) {
                String fieldValue = fields.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    String encodedValue = URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString());

                    if (hashData.length() > 0) {
                        hashData.append('&');
                    }
                    hashData.append(fieldName).append('=').append(encodedValue);
                }
            }

            String signValue = VNPayConfig.hmacSHA512(vnpayConfig.getHashSecret(), hashData.toString());
            if (signValue.equalsIgnoreCase(vnp_SecureHash)) {
                String orderIdStr = request.getParameter("vnp_TxnRef");
                String responseCode = request.getParameter("vnp_ResponseCode");

                // Xử lý nạp tiền ví qua VNPay
                if (orderIdStr != null && orderIdStr.startsWith("WALLET_DEPOSIT_")) {
                    Long userId = Long.parseLong(orderIdStr.substring("WALLET_DEPOSIT_".length()));
                    String amountStr = request.getParameter("vnp_Amount");
                    BigDecimal amount = new BigDecimal(amountStr).divide(new BigDecimal(100)); // VNPay nhân 100

                    if ("00".equals(responseCode)) {
                        walletService.processDepositVNPaySuccess(userId, amount);
                        return ResponseEntity.ok(Map.of(
                            "status", "SUCCESS",
                            "message", "Nạp tiền vào ví điện tử thành công số tiền: " + amount.toPlainString() + "đ"
                        ));
                    } else {
                        return ResponseEntity.ok(Map.of(
                            "status", "FAILED",
                            "message", "Nạp tiền vào ví điện tử thất bại hoặc bị hủy. Mã lỗi: " + responseCode
                        ));
                    }
                }

                // Xử lý nếu là giao dịch tạm giữ Escrow
                if (orderIdStr != null && orderIdStr.startsWith("ESCROW_")) {
                    Long requestId = Long.parseLong(orderIdStr.substring("ESCROW_".length()));
                    if ("00".equals(responseCode)) {
                        escrowService.processVNPayCallbackSuccess(requestId);
                        return ResponseEntity.ok(Map.of(
                            "status", "SUCCESS",
                            "message", "Nạp tiền tạm giữ (Escrow) cho yêu cầu #" + requestId + " thành công!"
                        ));
                    } else {
                        return ResponseEntity.ok(Map.of(
                            "status", "FAILED",
                            "message", "Thanh toán tạm giữ thất bại hoặc đã bị hủy. Mã lỗi: " + responseCode
                        ));
                    }
                }

                Long orderId = Long.parseLong(orderIdStr);

                if ("00".equals(responseCode)) {
                    orderService.updateOrderStatus(orderId, "PAID");
                    return ResponseEntity.ok(Map.of(
                        "status", "SUCCESS", 
                        "message", "Thanh toán đơn hàng #" + orderId + " thành công!"
                    ));
                } else {
                    orderService.updateOrderStatus(orderId, "FAILED");
                    return ResponseEntity.ok(Map.of(
                        "status", "FAILED", 
                        "message", "Thanh toán thất bại hoặc đã bị hủy. Mã lỗi: " + responseCode
                    ));
                }
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "INVALID_SIGNATURE", 
                    "message", "Chữ ký kiểm tra từ VNPay không hợp lệ"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "status", "ERROR", 
                "message", e.getMessage()
            ));
        }
    }
}
