package com.example.backend.controller;

import com.example.backend.config.VNPayConfig;
import com.example.backend.entity.User;
import com.example.backend.entity.WithdrawalRequest;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.WalletService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/users/wallet")
@CrossOrigin(origins = "http://localhost:5173")
public class WalletController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletService walletService;

    @Autowired
    private VNPayConfig vnpayConfig;

    private Long getUserIdFromHeaders(String customerId, String contractorId, String userId) {
        Long id = null;
        if (userId != null && !userId.isEmpty()) id = Long.parseLong(userId);
        if (id == null && customerId != null && !customerId.isEmpty()) id = Long.parseLong(customerId);
        if (id == null && contractorId != null && !contractorId.isEmpty()) id = Long.parseLong(contractorId);
        return id;
    }

    @GetMapping
    public ResponseEntity<?> getWalletBalance(
            @RequestHeader(value = "X-Customer-Id", required = false) String customerId,
            @RequestHeader(value = "X-Contractor-Id", required = false) String contractorId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        
        Long id = getUserIdFromHeaders(customerId, contractorId, userId);
        if (id == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User ID is missing from headers"));
        }

        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        BigDecimal balance = user.getWalletBalance() != null ? user.getWalletBalance() : BigDecimal.ZERO;
        return ResponseEntity.ok(Map.of(
            "userId", user.getId(),
            "fullName", user.getFullName(),
            "walletBalance", balance
        ));
    }

    @PostMapping("/deposit-mock")
    public ResponseEntity<?> depositMock(
            @RequestHeader(value = "X-Customer-Id", required = false) String customerId,
            @RequestHeader(value = "X-Contractor-Id", required = false) String contractorId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestBody Map<String, Object> body) {

        Long id = getUserIdFromHeaders(customerId, contractorId, userId);
        if (id == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User ID is missing from headers"));
        }

        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        try {
            User user = walletService.depositMock(id, amount);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/deposit-vnpay")
    public ResponseEntity<?> depositVNPay(
            @RequestHeader(value = "X-Customer-Id", required = false) String customerId,
            @RequestHeader(value = "X-Contractor-Id", required = false) String contractorId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {

        Long id = getUserIdFromHeaders(customerId, contractorId, userId);
        if (id == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User ID is missing from headers"));
        }

        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Số tiền nạp phải lớn hơn 0"));
        }

        try {
            Map<String, String> vnp_Params = new HashMap<>();
            vnp_Params.put("vnp_Version", "2.1.0");
            vnp_Params.put("vnp_Command", "pay");
            vnp_Params.put("vnp_TmnCode", vnpayConfig.getTmnCode());
            vnp_Params.put("vnp_Amount", String.valueOf(amount.multiply(new BigDecimal(100)).longValue()));
            vnp_Params.put("vnp_CurrCode", "VND");
            vnp_Params.put("vnp_TxnRef", "WALLET_DEPOSIT_" + id);
            vnp_Params.put("vnp_OrderInfo", "Nap tien vao vi cho user " + id);
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

    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(
            @RequestHeader(value = "X-Customer-Id", required = false) String customerId,
            @RequestHeader(value = "X-Contractor-Id", required = false) String contractorId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        Long id = getUserIdFromHeaders(customerId, contractorId, userId);
        if (id == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User ID is missing from headers"));
        }

        try {
            return ResponseEntity.ok(walletService.getTransactionHistory(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/withdraw-request")
    public ResponseEntity<?> withdrawRequest(
            @RequestHeader(value = "X-Customer-Id", required = false) String customerId,
            @RequestHeader(value = "X-Contractor-Id", required = false) String contractorId,
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestBody Map<String, Object> body) {

        Long id = getUserIdFromHeaders(customerId, contractorId, userId);
        if (id == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User ID is missing from headers"));
        }

        BigDecimal amount = new BigDecimal(body.get("amount").toString());
        String bankName = body.get("bankName").toString();
        String accountNumber = body.get("accountNumber").toString();
        String accountHolderName = body.get("accountHolderName").toString();

        try {
            WithdrawalRequest req = walletService.createWithdrawRequest(id, amount, bankName, accountNumber, accountHolderName);
            return ResponseEntity.ok(req);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/withdraw-requests")
    public ResponseEntity<?> getWithdrawRequests(
            @RequestHeader(value = "X-Customer-Id", required = false) String customerId,
            @RequestHeader(value = "X-Contractor-Id", required = false) String contractorId,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        Long id = getUserIdFromHeaders(customerId, contractorId, userId);
        if (id == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User ID is missing from headers"));
        }

        try {
            return ResponseEntity.ok(walletService.getMyWithdrawalRequests(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ================= ADMIN WITHDRAWAL ENDPOINTS =================

    @GetMapping("/admin/withdraw-requests")
    public ResponseEntity<?> getAllWithdrawRequests() {
        try {
            return ResponseEntity.ok(walletService.getAllWithdrawalRequests());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/withdraw-requests/{id}/approve")
    public ResponseEntity<?> approveWithdrawal(@PathVariable Long id) {
        try {
            WithdrawalRequest req = walletService.approveWithdrawal(id);
            return ResponseEntity.ok(req);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/admin/withdraw-requests/{id}/reject")
    public ResponseEntity<?> rejectWithdrawal(@PathVariable Long id) {
        try {
            WithdrawalRequest req = walletService.rejectWithdrawal(id);
            return ResponseEntity.ok(req);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
