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
    @Autowired private ProductImageRepository productImageRepository;

    // ─────────────────────────────────────────────────────────────
    // DASHBOARD STATISTICS
    // ─────────────────────────────────────────────────────────────

    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats(
            @RequestParam(value = "startDate", required = false) String startDateStr,
            @RequestParam(value = "endDate", required = false) String endDateStr) {

        java.time.LocalDateTime start = null;
        java.time.LocalDateTime end = null;

        if (startDateStr != null && !startDateStr.isBlank()) {
            try {
                java.time.LocalDate sDate = java.time.LocalDate.parse(startDateStr.trim());
                start = sDate.atStartOfDay();
            } catch (Exception e) {
                // ignore
            }
        }

        if (endDateStr != null && !endDateStr.isBlank()) {
            try {
                java.time.LocalDate eDate = java.time.LocalDate.parse(endDateStr.trim());
                end = eDate.atTime(23, 59, 59);
            } catch (Exception e) {
                // ignore
            }
        }

        long totalUsers;
        long totalContractors;
        long totalOrders;
        long pendingOrders;
        long completedOrders;
        long cancelledOrders;
        long totalCustomOrders;
        long openCustomOrders;
        long inProgressCustomOrders;
        long completedCustomOrders;
        BigDecimal totalRevenue;
        long totalProducts = productRepository.count();

        if (start != null || end != null) {
            if (start == null) start = java.time.LocalDateTime.of(2000, 1, 1, 0, 0);
            if (end == null) end = java.time.LocalDateTime.now();

            totalUsers = userRepository.countByRoleAndCreatedAtBetween(Role.CUSTOMER, start, end);
            totalContractors = userRepository.countByRoleAndCreatedAtBetween(Role.CONTRACTOR, start, end);
            totalOrders = orderRepository.countByCreatedAtBetween(start, end);
            pendingOrders = orderRepository.countByStatusAndCreatedAtBetween("PENDING", start, end);
            completedOrders = orderRepository.countByStatusAndCreatedAtBetween("COMPLETED", start, end);
            cancelledOrders = orderRepository.countByStatusAndCreatedAtBetween("CANCELLED", start, end);
            totalCustomOrders = customOrderRequestRepository.countByCreatedAtBetween(start, end);
            openCustomOrders = customOrderRequestRepository.countByStatusAndCreatedAtBetween(CustomOrderRequest.Status.OPEN, start, end);
            inProgressCustomOrders = customOrderRequestRepository.countByStatusAndCreatedAtBetween(CustomOrderRequest.Status.IN_PROGRESS, start, end);
            completedCustomOrders = customOrderRequestRepository.countByStatusAndCreatedAtBetween(CustomOrderRequest.Status.COMPLETED, start, end);
            totalRevenue = orderRepository.sumRevenueBetween(start, end);
        } else {
            totalUsers = userRepository.countByRole(Role.CUSTOMER);
            totalContractors = userRepository.countByRole(Role.CONTRACTOR);
            totalOrders = orderRepository.count();
            pendingOrders = orderRepository.countByStatus("PENDING");
            completedOrders = orderRepository.countByStatus("COMPLETED");
            cancelledOrders = orderRepository.countByStatus("CANCELLED");
            totalCustomOrders = customOrderRequestRepository.count();
            openCustomOrders = customOrderRequestRepository.countByStatus(CustomOrderRequest.Status.OPEN);
            inProgressCustomOrders = customOrderRequestRepository.countByStatus(CustomOrderRequest.Status.IN_PROGRESS);
            completedCustomOrders = customOrderRequestRepository.countByStatus(CustomOrderRequest.Status.COMPLETED);
            totalRevenue = orderRepository.sumTotalRevenue();
        }

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

        // ─── Generate Daily Stats for Chart ───
        java.time.LocalDateTime chartStart = start;
        java.time.LocalDateTime chartEnd = end;
        if (chartStart == null) {
            java.time.LocalDateTime minCreated = orderRepository.findMinCreatedAt();
            if (minCreated != null) {
                chartStart = minCreated.toLocalDate().atStartOfDay();
            } else {
                chartStart = java.time.LocalDateTime.now().minusDays(29).toLocalDate().atStartOfDay();
            }
        }
        if (chartEnd == null) {
            chartEnd = java.time.LocalDateTime.now();
        }

        List<Map<String, Object>> chartData = new ArrayList<>();
        java.time.LocalDate cS = chartStart.toLocalDate();
        java.time.LocalDate cE = chartEnd.toLocalDate();

        // Limit to max 60 days to keep the chart readable while showing history
        if (java.time.temporal.ChronoUnit.DAYS.between(cS, cE) > 60) {
            cS = cE.minusDays(59);
        }

        while (!cS.isAfter(cE)) {
            java.time.LocalDateTime ds = cS.atStartOfDay();
            java.time.LocalDateTime de = cS.atTime(23, 59, 59);

            long count = orderRepository.countByCreatedAtBetween(ds, de);
            BigDecimal rev = orderRepository.sumRevenueBetween(ds, de);
            if (rev == null) rev = BigDecimal.ZERO;

            Map<String, Object> day = new LinkedHashMap<>();
            day.put("date", cS.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM")));
            day.put("orders", count);
            day.put("revenue", rev);

            chartData.add(day);
            cS = cS.plusDays(1);
        }
        stats.put("chartData", chartData);

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

    // ─────────────────────────────────────────────────────────────
    // PRODUCT MANAGEMENT (Admin)
    // ─────────────────────────────────────────────────────────────

    /** Lấy danh sách tất cả sản phẩm kèm ảnh đại diện */
    @GetMapping("/products")
    public ResponseEntity<?> getAllProducts() {
        List<Product> products = productRepository.findAll();
        List<Map<String, Object>> result = products.stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", p.getId());
            m.put("name", p.getName());
            m.put("slug", p.getSlug());
            m.put("categoryName", p.getCategory() != null ? p.getCategory().getName() : "");
            m.put("priceCurrent", p.getPriceCurrent());
            m.put("priceOriginal", p.getPriceOriginal());
            m.put("priceContact", p.getPriceContact());
            m.put("status", p.getStatus().name());
            m.put("stock", p.getStock());
            m.put("ratingStars", p.getRatingStars());
            m.put("ratingCount", p.getRatingCount());
            // Ảnh đại diện (primary)
            List<ProductImage> imgs = productImageRepository.findByProductIdOrderBySortOrderAsc(p.getId());
            String primaryImg = imgs.stream()
                .filter(ProductImage::isPrimary)
                .map(ProductImage::getImageUrl)
                .findFirst()
                .orElse(imgs.isEmpty() ? "" : imgs.get(0).getImageUrl());
            m.put("primaryImage", primaryImg);
            m.put("imageCount", imgs.size());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    /** Lấy tất cả ảnh của 1 sản phẩm */
    @GetMapping("/products/{id}/images")
    public ResponseEntity<?> getProductImages(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        List<ProductImage> images = productImageRepository.findByProductIdOrderBySortOrderAsc(id);
        List<Map<String, Object>> result = images.stream().map(img -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", img.getId());
            m.put("imageUrl", img.getImageUrl());
            m.put("isPrimary", img.isPrimary());
            m.put("sortOrder", img.getSortOrder());
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    /** Cập nhật URL của 1 ảnh cụ thể theo imageId */
    @PutMapping("/products/images/{imageId}")
    public ResponseEntity<?> updateImageUrl(
            @PathVariable Long imageId,
            @RequestBody Map<String, String> body) {
        String newUrl = body.get("imageUrl");
        if (newUrl == null || newUrl.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Thiếu trường imageUrl"));
        }
        return productImageRepository.findById(imageId).map(img -> {
            img.setImageUrl(newUrl.trim());
            productImageRepository.save(img);
            return ResponseEntity.ok(Map.of(
                "message", "Cập nhật ảnh thành công",
                "id", img.getId(),
                "imageUrl", img.getImageUrl()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Thay toàn bộ ảnh của 1 sản phẩm (xóa cũ, thêm mới) */
    @PutMapping("/products/{id}/images")
    public ResponseEntity<?> replaceProductImages(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        return productRepository.findById(id).map(product -> {
            @SuppressWarnings("unchecked")
            List<String> urls = (List<String>) body.get("imageUrls");
            if (urls == null || urls.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Danh sách imageUrls không được rỗng"));
            }
            // Xóa ảnh cũ
            productImageRepository.deleteByProductId(id);
            // Thêm ảnh mới
            for (int i = 0; i < urls.size(); i++) {
                ProductImage img = new ProductImage();
                img.setProduct(product);
                img.setImageUrl(urls.get(i).trim());
                img.setPrimary(i == 0);
                img.setSortOrder(i);
                productImageRepository.save(img);
            }
            return ResponseEntity.ok(Map.of(
                "message", "Đã cập nhật " + urls.size() + " ảnh cho sản phẩm",
                "productId", id
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Thêm 1 ảnh mới vào sản phẩm */
    @PostMapping("/products/{id}/images")
    public ResponseEntity<?> addProductImage(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        return productRepository.findById(id).map(product -> {
            String url = (String) body.get("imageUrl");
            if (url == null || url.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Thiếu trường imageUrl"));
            }
            boolean isPrimary = Boolean.TRUE.equals(body.get("isPrimary"));
            List<ProductImage> existing = productImageRepository.findByProductIdOrderBySortOrderAsc(id);
            // Nếu set primary mới, bỏ primary cũ
            if (isPrimary) {
                existing.forEach(img -> { img.setPrimary(false); productImageRepository.save(img); });
            }
            ProductImage img = new ProductImage();
            img.setProduct(product);
            img.setImageUrl(url.trim());
            img.setPrimary(isPrimary || existing.isEmpty());
            img.setSortOrder(existing.size());
            productImageRepository.save(img);
            return ResponseEntity.ok(Map.of(
                "message", "Đã thêm ảnh thành công",
                "id", img.getId(),
                "imageUrl", img.getImageUrl(),
                "isPrimary", img.isPrimary()
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Xóa 1 ảnh */
    @DeleteMapping("/products/images/{imageId}")
    public ResponseEntity<?> deleteProductImage(@PathVariable Long imageId) {
        return productImageRepository.findById(imageId).map(img -> {
            productImageRepository.delete(img);
            return ResponseEntity.ok(Map.of("message", "Đã xóa ảnh"));
        }).orElse(ResponseEntity.notFound().build());
    }

    /** Set ảnh làm primary */
    @PatchMapping("/products/images/{imageId}/set-primary")
    public ResponseEntity<?> setPrimaryImage(@PathVariable Long imageId) {
        return productImageRepository.findById(imageId).map(img -> {
            // Bỏ primary tất cả ảnh cùng sản phẩm
            productImageRepository.findByProductIdOrderBySortOrderAsc(img.getProduct().getId())
                .forEach(i -> { i.setPrimary(false); productImageRepository.save(i); });
            img.setPrimary(true);
            productImageRepository.save(img);
            return ResponseEntity.ok(Map.of("message", "Đã set ảnh đại diện", "imageId", imageId));
        }).orElse(ResponseEntity.notFound().build());
    }
}
