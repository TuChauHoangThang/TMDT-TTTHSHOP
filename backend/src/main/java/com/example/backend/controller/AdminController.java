package com.example.backend.controller;

import com.example.backend.entity.*;
import com.example.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired private UserRepository userRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private CustomOrderRequestRepository customOrderRequestRepository;
    @Autowired private ShopRepository shopRepository;
    @Autowired private ProductRepository productRepository;

    // ─────────────────────────────────────────────────────────────
    // DASHBOARD STATISTICS
    // ─────────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        long totalUsers       = userRepository.countByRole(Role.CUSTOMER);
        long totalContractors = userRepository.countByRole(Role.CONTRACTOR);
        long totalOrders      = orderRepository.count();
        long pendingOrders    = orderRepository.countByStatus("PENDING");
        long completedOrders  = orderRepository.countByStatus("COMPLETED");
        long cancelledOrders  = orderRepository.countByStatus("CANCELLED");
        long totalCustomOrders = customOrderRequestRepository.count();
        long openCustomOrders  = customOrderRequestRepository.countByStatus(CustomOrderRequest.Status.OPEN);
        long inProgressCustomOrders = customOrderRequestRepository.countByStatus(CustomOrderRequest.Status.IN_PROGRESS);
        long completedCustomOrders  = customOrderRequestRepository.countByStatus(CustomOrderRequest.Status.COMPLETED);
        BigDecimal totalRevenue = orderRepository.sumTotalRevenue();
        long totalProducts    = productRepository.count();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("totalContractors", totalContractors);
        stats.put("totalOrders", totalOrders);
        stats.put("pendingOrders", pendingOrders);
        stats.put("completedOrders", completedOrders);
        stats.put("cancelledOrders", cancelledOrders);
        stats.put("totalCustomOrders", totalCustomOrders);
        stats.put("openCustomOrders", openCustomOrders);
        stats.put("inProgressCustomOrders", inProgressCustomOrders);
        stats.put("completedCustomOrders", completedCustomOrders);
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalProducts", totalProducts);

        return ResponseEntity.ok(stats);
    }

    // ─────────────────────────────────────────────────────────────
    // USER MANAGEMENT
    // ─────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> users = userRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> result = users.stream().map(u -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("fullName", u.getFullName());
            m.put("email", u.getEmail());
            m.put("phone", u.getPhone() != null ? u.getPhone() : "");
            m.put("role", u.getRole().name());
            m.put("isActive", u.isActive());
            m.put("createdAt", u.getCreatedAt());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/users/customers")
    public ResponseEntity<?> getCustomers() {
        List<User> users = userRepository.findByRoleOrderByCreatedAtDesc(Role.CUSTOMER);
        List<Map<String, Object>> result = users.stream().map(u -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("fullName", u.getFullName());
            m.put("email", u.getEmail());
            m.put("phone", u.getPhone() != null ? u.getPhone() : "");
            m.put("isActive", u.isActive());
            m.put("createdAt", u.getCreatedAt());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/users/contractors")
    public ResponseEntity<?> getContractors() {
        List<User> contractors = userRepository.findByRoleOrderByCreatedAtDesc(Role.CONTRACTOR);
        List<Map<String, Object>> result = contractors.stream().map(u -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("fullName", u.getFullName());
            m.put("email", u.getEmail());
            m.put("phone", u.getPhone() != null ? u.getPhone() : "");
            m.put("isActive", u.isActive());
            m.put("createdAt", u.getCreatedAt());
            // Lấy thông tin shop
            shopRepository.findByOwnerId(u.getId()).ifPresent(shop -> {
                m.put("shopId", shop.getId());
                m.put("shopName", shop.getName());
                m.put("shopSlug", shop.getSlug());
                m.put("shopRating", shop.getRating());
                m.put("shopRatingCount", shop.getRatingCount());
                m.put("shopAddress", shop.getAddress() != null ? shop.getAddress() : "");
            });
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/users/{id}/toggle-active")
    public ResponseEntity<?> toggleUserActive(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            user.setActive(!user.isActive());
            userRepository.save(user);
            return ResponseEntity.ok(Map.of(
                "message", user.isActive() ? "Đã kích hoạt tài khoản" : "Đã vô hiệu hoá tài khoản",
                "isActive", user.isActive()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────────────────────────
    // ORDER MANAGEMENT
    // ─────────────────────────────────────────────────────────────

    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders() {
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> result = orders.stream().map(o -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", o.getId());
            m.put("customerId", o.getCustomerId());
            m.put("fullName", o.getFullName());
            m.put("phone", o.getPhone());
            m.put("address", o.getAddress());
            m.put("paymentMethod", o.getPaymentMethod());
            m.put("status", o.getStatus());
            m.put("totalAmount", o.getTotalAmount());
            m.put("itemCount", o.getItems().size());
            m.put("createdAt", o.getCreatedAt());
            m.put("note", o.getNote() != null ? o.getNote() : "");
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderDetail(@PathVariable Long id) {
        return orderRepository.findById(id)
            .map(o -> ResponseEntity.ok((Object) o))
            .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Thiếu trường status"));
        }
        return orderRepository.findById(id).map(order -> {
            order.setStatus(newStatus.toUpperCase());
            orderRepository.save(order);
            return ResponseEntity.ok(Map.of(
                "message", "Cập nhật trạng thái đơn hàng thành công",
                "status", order.getStatus()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─────────────────────────────────────────────────────────────
    // CUSTOM ORDER MANAGEMENT
    // ─────────────────────────────────────────────────────────────

    @GetMapping("/custom-orders")
    public ResponseEntity<?> getAllCustomOrders() {
        List<CustomOrderRequest> requests = customOrderRequestRepository.findAllByOrderByCreatedAtDesc();
        List<Map<String, Object>> result = requests.stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r.getId());
            m.put("customerId", r.getCustomerId());
            m.put("title", r.getTitle());
            m.put("furnitureType", r.getFurnitureType() != null ? r.getFurnitureType() : "");
            m.put("budgetMin", r.getBudgetMin());
            m.put("budgetMax", r.getBudgetMax());
            m.put("deadline", r.getDeadline());
            m.put("status", r.getStatus().name());
            m.put("quoteCount", r.getQuotes().size());
            m.put("selectedQuoteId", r.getSelectedQuoteId());
            m.put("createdAt", r.getCreatedAt());
            // Lấy tên khách hàng
            userRepository.findById(r.getCustomerId()).ifPresent(u ->
                m.put("customerName", u.getFullName())
            );
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/custom-orders/{id}")
    public ResponseEntity<?> getCustomOrderDetail(@PathVariable Long id) {
        return customOrderRequestRepository.findById(id).map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r.getId());
            m.put("customerId", r.getCustomerId());
            m.put("title", r.getTitle());
            m.put("description", r.getDescription());
            m.put("furnitureType", r.getFurnitureType());
            m.put("material", r.getMaterial());
            m.put("dimensions", r.getDimensions());
            m.put("colorStyle", r.getColorStyle());
            m.put("budgetMin", r.getBudgetMin());
            m.put("budgetMax", r.getBudgetMax());
            m.put("deadline", r.getDeadline());
            m.put("status", r.getStatus().name());
            m.put("selectedQuoteId", r.getSelectedQuoteId());
            m.put("createdAt", r.getCreatedAt());
            m.put("updatedAt", r.getUpdatedAt());
            // Ảnh
            List<String> imageUrls = r.getImages().stream()
                .map(img -> img.getImageUrl())
                .collect(Collectors.toList());
            m.put("imageUrls", imageUrls);
            // Báo giá
            List<Map<String, Object>> quotes = r.getQuotes().stream().map(q -> {
                Map<String, Object> qm = new LinkedHashMap<>();
                qm.put("id", q.getId());
                qm.put("contractorId", q.getContractorId());
                qm.put("shopId", q.getShopId());
                qm.put("quotedPrice", q.getQuotedPrice());
                qm.put("estimatedDays", q.getEstimatedDays());
                qm.put("note", q.getNote());
                qm.put("status", q.getStatus().name());
                qm.put("createdAt", q.getCreatedAt());
                userRepository.findById(q.getContractorId()).ifPresent(u ->
                    qm.put("contractorName", u.getFullName())
                );
                shopRepository.findById(q.getShopId()).ifPresent(s ->
                    qm.put("shopName", s.getName())
                );
                return qm;
            }).collect(Collectors.toList());
            m.put("quotes", quotes);
            // Tên khách hàng
            userRepository.findById(r.getCustomerId()).ifPresent(u -> {
                m.put("customerName", u.getFullName());
                m.put("customerPhone", u.getPhone() != null ? u.getPhone() : "");
            });
            return ResponseEntity.ok((Object) m);
        }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/custom-orders/{id}/status")
    public ResponseEntity<?> updateCustomOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Thiếu trường status"));
        }
        return customOrderRequestRepository.findById(id).map(r -> {
            try {
                r.setStatus(CustomOrderRequest.Status.valueOf(newStatus.toUpperCase()));
                customOrderRequestRepository.save(r);
                return ResponseEntity.ok(Map.of(
                    "message", "Cập nhật trạng thái thành công",
                    "status", r.getStatus().name()
                ));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Trạng thái không hợp lệ: " + newStatus));
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}
