package com.example.backend.controller;

import com.example.backend.dto.CustomOrderDto;
import com.example.backend.entity.CustomOrderQuote;
import com.example.backend.entity.CustomOrderRequest;
import com.example.backend.service.CustomOrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * REST API cho Custom Order RFQ
 * Base: /api/custom-orders
 */
@RestController
@RequestMapping("/api/custom-orders")
@CrossOrigin(origins = "http://localhost:5173") // Vite dev server
public class CustomOrderController {

    private final CustomOrderService service;

    public CustomOrderController(CustomOrderService service) {
        this.service = service;
    }

    // ==================== CUSTOMER ENDPOINTS ====================

    /**
     * POST /api/custom-orders
     * Customer tạo yêu cầu đặt hàng mới
     * TODO: Lấy customerId từ JWT SecurityContext thay vì header
     */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> createRequest(
            @RequestHeader("X-Customer-Id") Long customerId,      // Tạm dùng header, sau thay bằng JWT
            @RequestPart("data") @Valid CustomOrderDto.CreateRequest dto,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) {
        try {
            CustomOrderRequest created = service.createRequest(customerId, dto, images);
            return ResponseEntity.ok(CustomOrderDto.RequestResponse.from(created, false));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/custom-orders
     * Lấy danh sách yêu cầu của customer đang đăng nhập
     */
    @GetMapping
    public ResponseEntity<List<CustomOrderDto.RequestResponse>> getMyRequests(
            @RequestHeader("X-Customer-Id") Long customerId) {
        List<CustomOrderRequest> requests = service.getMyRequests(customerId);
        List<CustomOrderDto.RequestResponse> response = requests.stream()
                .map(r -> CustomOrderDto.RequestResponse.from(r, false))
                .toList();
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/custom-orders/{id}
     * Xem chi tiết yêu cầu + danh sách báo giá (của customer)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getRequestDetail(
            @PathVariable Long id,
            @RequestHeader("X-Customer-Id") Long customerId) {
        try {
            CustomOrderRequest request = service.getRequestById(id, customerId);
            return ResponseEntity.ok(CustomOrderDto.RequestResponse.from(request, true));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/custom-orders/{id}/select-quote/{quoteId}
     * Customer chọn báo giá từ một nhà thầu
     */
    @PostMapping("/{id}/select-quote/{quoteId}")
    public ResponseEntity<?> selectQuote(
            @PathVariable Long id,
            @PathVariable Long quoteId,
            @RequestHeader("X-Customer-Id") Long customerId) {
        try {
            CustomOrderRequest updated = service.selectQuote(id, quoteId, customerId);
            return ResponseEntity.ok(CustomOrderDto.RequestResponse.from(updated, true));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PATCH /api/custom-orders/{id}/cancel
     * Customer hủy yêu cầu
     */
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<?> cancelRequest(
            @PathVariable Long id,
            @RequestHeader("X-Customer-Id") Long customerId) {
        try {
            service.cancelRequest(id, customerId);
            return ResponseEntity.ok(Map.of("message", "Yêu cầu đã được hủy thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== CONTRACTOR ENDPOINTS ====================

    /**
     * GET /api/custom-orders/open
     * Contractor xem danh sách yêu cầu đang mở (có tìm kiếm + phân trang)
     */
    @GetMapping("/open")
    public ResponseEntity<Page<CustomOrderDto.RequestResponse>> getOpenRequests(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String furnitureType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CustomOrderRequest> result = service.getOpenRequests(keyword, furnitureType, pageable);
        Page<CustomOrderDto.RequestResponse> response = result.map(r -> CustomOrderDto.RequestResponse.from(r, false));
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/custom-orders/open/{id}
     * Contractor xem chi tiết một yêu cầu (ẩn thông tin cá nhân customer)
     */
    @GetMapping("/open/{id}")
    public ResponseEntity<?> getOpenRequestDetail(@PathVariable Long id) {
        try {
            CustomOrderRequest request = service.getOpenRequestById(id);
            return ResponseEntity.ok(CustomOrderDto.RequestResponse.from(request, true));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * POST /api/custom-orders/{id}/quotes
     * Contractor gửi (hoặc cập nhật) báo giá
     */
    @PostMapping("/{id}/quotes")
    public ResponseEntity<?> submitQuote(
            @PathVariable Long id,
            @RequestHeader("X-Contractor-Id") Long contractorId,
            @RequestHeader("X-Shop-Id") Long shopId,
            @RequestBody @Valid CustomOrderDto.SubmitQuote dto) {
        try {
            CustomOrderQuote quote = service.submitQuote(id, contractorId, shopId, dto);
            return ResponseEntity.ok(CustomOrderDto.QuoteResponse.from(quote));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/custom-orders/{id}/quotes/{quoteId}
     * Contractor rút/hủy báo giá (chỉ khi chưa được chọn)
     */
    @DeleteMapping("/{id}/quotes/{quoteId}")
    public ResponseEntity<?> withdrawQuote(
            @PathVariable Long id,
            @PathVariable Long quoteId,
            @RequestHeader("X-Contractor-Id") Long contractorId) {
        try {
            service.withdrawQuote(id, quoteId, contractorId);
            return ResponseEntity.ok(Map.of("message", "Đã rút báo giá thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
