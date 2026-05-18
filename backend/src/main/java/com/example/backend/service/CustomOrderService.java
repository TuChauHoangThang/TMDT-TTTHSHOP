package com.example.backend.service;

import com.example.backend.dto.CustomOrderDto;
import com.example.backend.entity.CustomOrderImage;
import com.example.backend.entity.CustomOrderQuote;
import com.example.backend.entity.CustomOrderRequest;
import com.example.backend.entity.User; // Giả sử entity User của bạn ở đây
import com.example.backend.repository.CustomOrderQuoteRepository;
import com.example.backend.repository.CustomOrderRequestRepository;
import com.example.backend.repository.UserRepository; // Repository bảng User
import com.example.backend.repository.ShopRepository; // Repository bảng Shop
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class CustomOrderService {

    private static final String UPLOAD_DIR = "uploads/custom-orders/";

    private final CustomOrderRequestRepository requestRepo;
    private final CustomOrderQuoteRepository quoteRepo;
    private final UserRepository userRepo; // Inject thêm UserRepository
    private final ShopRepository shopRepo; // Inject thêm ShopRepository

    public CustomOrderService(CustomOrderRequestRepository requestRepo,
                              CustomOrderQuoteRepository quoteRepo,
                              UserRepository userRepo,
                              ShopRepository shopRepo) {
        this.requestRepo = requestRepo;
        this.quoteRepo = quoteRepo;
        this.userRepo = userRepo;
        this.shopRepo = shopRepo;
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            System.err.println("Không thể tạo thư mục upload: " + e.getMessage());
        }
    }

    /**
     * Hàm bổ trợ để lấy Tên và SĐT từ bảng User đổ vào QuoteResponse DTO
     */
    private void enrichQuoteInfo(CustomOrderDto.QuoteResponse quoteDto) {
        userRepo.findById(quoteDto.getContractorId()).ifPresent(user -> {
            quoteDto.setContractorName(user.getFullName()); // Lấy tên từ DB
            quoteDto.setContractorPhone(user.getPhone());       // Lấy SĐT từ DB
        });

        // Lấy thông tin Shop
        shopRepo.findById(quoteDto.getShopId()).ifPresent(shop -> {
            quoteDto.setShopName(shop.getName());
            quoteDto.setShopSlug(shop.getSlug());
            quoteDto.setShopAddress(shop.getAddress());
            quoteDto.setShopLogo(shop.getLogoUrl());
            quoteDto.setShopRating(shop.getRating().doubleValue());
        });
    }

    // ==================== CUSTOMER ====================

    public CustomOrderRequest createRequest(Long customerId, CustomOrderDto.CreateRequest dto, List<MultipartFile> images) {
        CustomOrderRequest request = new CustomOrderRequest();
        request.setCustomerId(customerId);
        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setFurnitureType(dto.getFurnitureType());
        request.setMaterial(dto.getMaterial());
        request.setDimensions(dto.getDimensions());
        request.setColorStyle(dto.getColorStyle());
        request.setBudgetMin(dto.getBudgetMin());
        request.setBudgetMax(dto.getBudgetMax());
        request.setDeadline(dto.getDeadline());
        request.setStatus(CustomOrderRequest.Status.OPEN);

        CustomOrderRequest saved = requestRepo.save(request);

        if (images != null && !images.isEmpty()) {
            try {
                Path uploadPath = Paths.get(UPLOAD_DIR + saved.getId());
                Files.createDirectories(uploadPath);
                for (MultipartFile file : images) {
                    if (!file.isEmpty()) {
                        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
                        Path filePath = uploadPath.resolve(filename);
                        file.transferTo(filePath.toAbsolutePath().toFile());

                        CustomOrderImage img = new CustomOrderImage();
                        img.setRequest(saved);
                        img.setImageUrl("/uploads/custom-orders/" + saved.getId() + "/" + filename);
                        saved.getImages().add(img);
                    }
                }
                requestRepo.save(saved);
            } catch (IOException e) {
                System.err.println("Lỗi upload ảnh cho đơn #" + saved.getId() + ": " + e.getMessage());
            }
        }
        return saved;
    }

    @Transactional(readOnly = true)
    public List<CustomOrderRequest> getMyRequests(Long customerId) {
        return requestRepo.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    /**
     * Lấy chi tiết kèm theo thông tin nhà thầu đã được "làm giàu"
     */
    @Transactional(readOnly = true)
    public CustomOrderDto.RequestResponse getRequestDetailResponse(Long id, Long customerId) {
        CustomOrderRequest request = requestRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu #" + id));

        if (!request.getCustomerId().equals(customerId)) {
            throw new RuntimeException("Bạn không có quyền xem yêu cầu này");
        }

        CustomOrderDto.RequestResponse resp = CustomOrderDto.RequestResponse.from(request, true);

        // Đổ thông tin Tên + SĐT vào từng quote
        if (resp.getQuotes() != null) {
            resp.getQuotes().forEach(this::enrichQuoteInfo);
        }

        return resp;
    }

    // Giữ nguyên hàm gốc để dùng nội bộ nếu cần
    @Transactional(readOnly = true)
    public CustomOrderRequest getRequestById(Long id, Long customerId) {
        CustomOrderRequest request = requestRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu #" + id));
        if (!request.getCustomerId().equals(customerId)) {
            throw new RuntimeException("Bạn không có quyền xem yêu cầu này");
        }
        return request;
    }

    public CustomOrderDto.RequestResponse selectQuote(Long requestId, Long quoteId, Long customerId) {
        CustomOrderRequest request = getRequestById(requestId, customerId);

        if (request.getStatus() != CustomOrderRequest.Status.OPEN &&
                request.getStatus() != CustomOrderRequest.Status.QUOTED) {
            throw new RuntimeException("Yêu cầu này không thể chọn báo giá ở trạng thái hiện tại");
        }

        CustomOrderQuote selectedQuote = quoteRepo.findById(quoteId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy báo giá"));

        if (!selectedQuote.getRequest().getId().equals(requestId)) {
            throw new RuntimeException("Báo giá không thuộc yêu cầu này");
        }

        request.getQuotes().forEach(q -> {
            if (q.getId().equals(quoteId)) {
                q.setStatus(CustomOrderQuote.Status.ACCEPTED);
            } else {
                q.setStatus(CustomOrderQuote.Status.REJECTED);
            }
        });

        request.setSelectedQuoteId(quoteId);
        request.setStatus(CustomOrderRequest.Status.IN_PROGRESS);
        requestRepo.save(request);

        // Trả về DTO đã có đầy đủ info nhà thầu
        CustomOrderDto.RequestResponse resp = CustomOrderDto.RequestResponse.from(request, true);
        resp.getQuotes().forEach(this::enrichQuoteInfo);
        return resp;
    }

    public void cancelRequest(Long requestId, Long customerId) {
        CustomOrderRequest request = getRequestById(requestId, customerId);
        if (request.getStatus() == CustomOrderRequest.Status.IN_PROGRESS ||
                request.getStatus() == CustomOrderRequest.Status.COMPLETED) {
            throw new RuntimeException("Không thể hủy yêu cầu ở trạng thái này");
        }
        request.setStatus(CustomOrderRequest.Status.CANCELLED);
        requestRepo.save(request);
    }

    // ==================== CONTRACTOR ====================

    @Transactional(readOnly = true)
    public Page<CustomOrderRequest> getOpenRequests(String keyword, String furnitureType, Pageable pageable) {
        return requestRepo.searchOpenRequests(
                (keyword != null && !keyword.isBlank()) ? keyword : null,
                (furnitureType != null && !furnitureType.isBlank()) ? furnitureType : null,
                pageable);
    }

    @Transactional(readOnly = true)
    public CustomOrderRequest getOpenRequestById(Long id) {
        CustomOrderRequest request = requestRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu #" + id));
        if (request.getStatus() == CustomOrderRequest.Status.CANCELLED) {
            throw new RuntimeException("Yêu cầu này đã bị hủy");
        }
        return request;
    }

    @Transactional(readOnly = true)
    public List<CustomOrderQuote> getActiveProjects(Long contractorId) {
        return quoteRepo.findByContractorIdAndStatus(contractorId, CustomOrderQuote.Status.ACCEPTED);
    }

    public CustomOrderQuote submitQuote(Long requestId, Long contractorId, CustomOrderDto.SubmitQuote dto, List<MultipartFile> images) {
        CustomOrderRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu"));

        // Tự tìm shopId từ contractorId trong DB để đảm bảo chính xác
        Long shopId = shopRepo.findByOwnerId(contractorId)
                .map(s -> s.getId())
                .orElseThrow(() -> new RuntimeException("Bạn cần tạo Shop trước khi báo giá"));

        if (request.getStatus() == CustomOrderRequest.Status.IN_PROGRESS ||
                request.getStatus() == CustomOrderRequest.Status.COMPLETED ||
                request.getStatus() == CustomOrderRequest.Status.CANCELLED) {
            throw new RuntimeException("Yêu cầu này không còn nhận báo giá");
        }

        if (quoteRepo.existsByRequest_IdAndContractorId(requestId, contractorId)) {
            throw new RuntimeException("Bạn đã báo giá cho yêu cầu này rồi.");
        }

        CustomOrderQuote quote = new CustomOrderQuote();
        quote.setRequest(request);
        quote.setContractorId(contractorId);
        quote.setShopId(shopId);
        quote.setQuotedPrice(dto.getQuotedPrice());
        quote.setEstimatedDays(dto.getEstimatedDays());
        quote.setNote(dto.getNote());
        if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
            quote.setImageUrls(String.join(",", dto.getImageUrls()));
        }

        // Xử lý upload ảnh mới nếu có
        if (images != null && !images.isEmpty()) {
            List<String> uploadedUrls = new java.util.ArrayList<>();
            for (MultipartFile file : images) {
                try {
                    String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                    java.nio.file.Path path = java.nio.file.Paths.get("uploads", fileName);
                    java.nio.file.Files.createDirectories(path.getParent());
                    java.nio.file.Files.copy(file.getInputStream(), path);
                    uploadedUrls.add("/uploads/" + fileName);
                } catch (java.io.IOException e) {
                    throw new RuntimeException("Lỗi lưu ảnh báo giá: " + e.getMessage());
                }
            }
            String currentUrls = quote.getImageUrls();
            if (currentUrls != null && !currentUrls.isBlank()) {
                quote.setImageUrls(currentUrls + "," + String.join(",", uploadedUrls));
            } else {
                quote.setImageUrls(String.join(",", uploadedUrls));
            }
        }

        quote.setStatus(CustomOrderQuote.Status.PENDING);

        CustomOrderQuote savedQuote = quoteRepo.save(quote);

        if (request.getStatus() == CustomOrderRequest.Status.OPEN) {
            request.setStatus(CustomOrderRequest.Status.QUOTED);
            requestRepo.save(request);
        }
        return savedQuote;
    }

    public void withdrawQuote(Long requestId, Long quoteId, Long contractorId) {
        CustomOrderQuote quote = quoteRepo.findById(quoteId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy báo giá"));
        if (!quote.getContractorId().equals(contractorId)) {
            throw new RuntimeException("Bạn không có quyền hủy báo giá này");
        }
        if (quote.getStatus() != CustomOrderQuote.Status.PENDING) {
            throw new RuntimeException("Chỉ có thể hủy báo giá đang chờ xét duyệt");
        }
        quote.setStatus(CustomOrderQuote.Status.WITHDRAWN);
        quoteRepo.save(quote);
    }
}