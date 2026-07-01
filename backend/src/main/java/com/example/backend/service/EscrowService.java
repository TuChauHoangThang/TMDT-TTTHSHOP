package com.example.backend.service;

import com.example.backend.entity.*;
import com.example.backend.repository.CustomOrderRequestRepository;
import com.example.backend.repository.EscrowRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class EscrowService {

    // Tỷ lệ hoa hồng platform: 5%
    private static final BigDecimal COMMISSION_RATE = new BigDecimal("0.05");

    // Email tài khoản admin nhận hoa hồng
    private static final String ADMIN_COMMISSION_EMAIL = "admin@test.com";

    @Autowired private EscrowRepository escrowRepository;
    @Autowired private CustomOrderRequestRepository requestRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private WalletService walletService;

    // ─────────────────────────────────────────────────────────────
    // TẠO ESCROW
    // ─────────────────────────────────────────────────────────────

    public Escrow createEscrow(CustomOrderRequest request, CustomOrderQuote quote) {
        escrowRepository.findByRequestId(request.getId())
                .ifPresent(e -> escrowRepository.delete(e));

        // Validate amount - quote phải có giá hợp lệ
        java.math.BigDecimal amount = quote.getQuotedPrice();
        if (amount == null || amount.compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Báo giá không có giá trị hợp lệ: " + amount);
        }

        BigDecimal commission = amount.multiply(COMMISSION_RATE).setScale(0, RoundingMode.HALF_UP);
        BigDecimal net = amount.subtract(commission);

        Escrow escrow = new Escrow();
        escrow.setRequest(request);
        escrow.setCustomer(userRepo.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng")));
        escrow.setContractor(userRepo.findById(quote.getContractorId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà thầu")));
        escrow.setAmount(amount);
        escrow.setCommissionRate(COMMISSION_RATE);
        escrow.setCommissionAmount(commission);
        escrow.setNetAmount(net);
        escrow.setStatus(EscrowStatus.PENDING);

        return escrowRepository.save(escrow);
    }

    // ─────────────────────────────────────────────────────────────
    // ĐẶT CỌC (3 phương thức)
    // ─────────────────────────────────────────────────────────────

    public Escrow depositMock(Long requestId) {
        Escrow escrow = getEscrowOrThrow(requestId);
        checkStatus(escrow, EscrowStatus.PENDING, "đặt cọc mock");
        escrow.setStatus(EscrowStatus.HELD);
        escrow.setPaymentMethod("MOCK");
        escrowRepository.save(escrow);
        setRequestStatus(escrow, CustomOrderRequest.Status.IN_PROGRESS);
        return escrow;
    }

    public Escrow depositWithWallet(Long requestId, Long customerId) {
        Escrow escrow = getEscrowOrThrow(requestId);
        checkStatus(escrow, EscrowStatus.PENDING, "đặt cọc ví");
        if (!escrow.getCustomer().getId().equals(customerId))
            throw new RuntimeException("Bạn không có quyền thực hiện giao dịch này");

        User customer = escrow.getCustomer();
        BigDecimal balance = safeBalance(customer);
        if (balance.compareTo(escrow.getAmount()) < 0)
            throw new RuntimeException("Số dư ví không đủ (" + balance + " < " + escrow.getAmount() + "). Vui lòng nạp thêm.");

        customer.setWalletBalance(balance.subtract(escrow.getAmount()));
        userRepo.save(customer);
        walletService.logTransaction(customer, escrow.getAmount().negate(), "ESCROW_DEPOSIT",
                "Đặt cọc escrow cho đơn hàng #" + requestId + " — tổng " + fmt(escrow.getAmount()));

        escrow.setStatus(EscrowStatus.HELD);
        escrow.setPaymentMethod("WALLET");
        escrowRepository.save(escrow);
        setRequestStatus(escrow, CustomOrderRequest.Status.IN_PROGRESS);
        return escrow;
    }

    public Escrow processVNPayCallbackSuccess(Long requestId) {
        Escrow escrow = getEscrowOrThrow(requestId);
        if (escrow.getStatus() == EscrowStatus.PENDING) {
            escrow.setStatus(EscrowStatus.HELD);
            escrow.setPaymentMethod("VNPAY");
            escrowRepository.save(escrow);
            setRequestStatus(escrow, CustomOrderRequest.Status.IN_PROGRESS);
        }
        return escrow;
    }

    // ─────────────────────────────────────────────────────────────
    // NHÀ THẦU XÁC NHẬN GIAO HÀNG
    // ─────────────────────────────────────────────────────────────

    public CustomOrderRequest markShipped(Long requestId, Long contractorId) {
        Escrow escrow = getEscrowOrThrow(requestId);
        if (!escrow.getContractor().getId().equals(contractorId))
            throw new RuntimeException("Bạn không phải nhà thầu của đơn hàng này");
        CustomOrderRequest req = escrow.getRequest();
        if (req.getStatus() != CustomOrderRequest.Status.IN_PROGRESS)
            throw new RuntimeException("Đơn hàng phải ở trạng thái IN_PROGRESS");
        req.setStatus(CustomOrderRequest.Status.COMPLETED_BY_CONTRACTOR);
        return requestRepo.save(req);
    }

    // ─────────────────────────────────────────────────────────────
    // KHÁCH XÁC NHẬN ĐÃ NHẬN HÀNG (chỉ đổi status, chờ admin giải ngân)
    // ─────────────────────────────────────────────────────────────

    public Escrow confirmDelivery(Long requestId, Long customerId) {
        Escrow escrow = getEscrowOrThrow(requestId);
        if (!escrow.getCustomer().getId().equals(customerId))
            throw new RuntimeException("Bạn không có quyền xác nhận đơn hàng này");
        if (escrow.getStatus() != EscrowStatus.HELD && escrow.getStatus() != EscrowStatus.DISPUTED)
            throw new RuntimeException("Escrow phải ở trạng thái HELD hoặc DISPUTED");

        escrow.setStatus(EscrowStatus.AWAITING_RELEASE);
        escrowRepository.save(escrow);

        // Đổi status request → chờ admin giải ngân
        CustomOrderRequest req = escrow.getRequest();
        req.setStatus(CustomOrderRequest.Status.COMPLETED_BY_CUSTOMER);
        requestRepo.save(req);

        return escrow;
    }

    // ─────────────────────────────────────────────────────────────
    // ADMIN GIẢI NGÂN (sau khi khách xác nhận)
    // ─────────────────────────────────────────────────────────────

    public Escrow adminRelease(Long escrowId) {
        Escrow escrow = escrowRepository.findById(escrowId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy escrow #" + escrowId));
        if (escrow.getStatus() != EscrowStatus.AWAITING_RELEASE)
            throw new RuntimeException("Escrow phải ở trạng thái AWAITING_RELEASE (khách đã xác nhận nhận hàng)");

        doRelease(escrow);
        setRequestStatus(escrow, CustomOrderRequest.Status.COMPLETED);
        return escrow;
    }

    // ─────────────────────────────────────────────────────────────
    // KHÁCH XÁC NHẬN → GIẢI NGÂN TỰ ĐỘNG (giữ lại cho backward compat, không dùng nữa)
    // ─────────────────────────────────────────────────────────────

    /** @deprecated Dùng confirmDelivery() + adminRelease() thay thế */
    public Escrow releaseEscrow(Long requestId, Long customerId) {
        // Redirect về confirmDelivery cho flow mới
        return confirmDelivery(requestId, customerId);
    }

    // ─────────────────────────────────────────────────────────────
    // KHÁCH KHIẾU NẠI
    // ─────────────────────────────────────────────────────────────

    public Escrow disputeEscrow(Long requestId, Long customerId, String reason) {
        Escrow escrow = getEscrowOrThrow(requestId);
        if (!escrow.getCustomer().getId().equals(customerId))
            throw new RuntimeException("Bạn không có quyền mở tranh chấp cho đơn hàng này");
        if (escrow.getStatus() != EscrowStatus.HELD)
            throw new RuntimeException("Chỉ có thể khiếu nại khi tiền đang được tạm giữ (HELD)");

        escrow.setStatus(EscrowStatus.DISPUTED);
        escrow.setDisputeReason(reason);
        escrowRepository.save(escrow);
        setRequestStatus(escrow, CustomOrderRequest.Status.DISPUTED);
        return escrow;
    }

    // ─────────────────────────────────────────────────────────────
    // ADMIN PHÂN XỬ TRANH CHẤP
    // ─────────────────────────────────────────────────────────────

    public Escrow resolveDispute(Long escrowId, String resolution, String notes) {
        Escrow escrow = escrowRepository.findById(escrowId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy escrow #" + escrowId));
        if (escrow.getStatus() != EscrowStatus.DISPUTED && escrow.getStatus() != EscrowStatus.AWAITING_RELEASE)
            throw new RuntimeException("Escrow này không ở trạng thái tranh chấp hoặc chờ giải ngân");

        escrow.setDisputeResolution(notes);

        if ("RELEASE".equalsIgnoreCase(resolution)) {
            // Admin xác nhận nhà thầu đúng → giải ngân (trừ hoa hồng)
            doRelease(escrow);
            setRequestStatus(escrow, CustomOrderRequest.Status.COMPLETED);

        } else if ("REFUND".equalsIgnoreCase(resolution)) {
            // Admin xác nhận khách đúng → hoàn tiền TOÀN BỘ cho khách (không trừ hoa hồng)
            doRefund(escrow, notes);
            setRequestStatus(escrow, CustomOrderRequest.Status.CANCELLED);

        } else {
            throw new RuntimeException("Quyết định không hợp lệ: " + resolution + " (phải là RELEASE hoặc REFUND)");
        }

        return escrowRepository.save(escrow);
    }

    // ─────────────────────────────────────────────────────────────
    // ADMIN: XEM TOÀN BỘ ESCROW
    // ─────────────────────────────────────────────────────────────

    public List<Escrow> getAllEscrows() {
        return escrowRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Escrow> getEscrowsByCustomer(Long customerId) {
        return escrowRepository.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    public List<Escrow> getEscrowsByContractor(Long contractorId) {
        return escrowRepository.findByContractorIdOrderByCreatedAtDesc(contractorId);
    }

    public Escrow getEscrowByRequestId(Long requestId) {
        return escrowRepository.findByRequestId(requestId).orElse(null);
    }

    // ─────────────────────────────────────────────────────────────
    // ADMIN: THỐNG KÊ HOA HỒNG
    // ─────────────────────────────────────────────────────────────

    public java.util.Map<String, Object> getCommissionStats() {
        List<Escrow> released = escrowRepository.findByStatus(EscrowStatus.RELEASED);
        BigDecimal totalCommission = released.stream()
                .map(e -> e.getCommissionAmount() != null ? e.getCommissionAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long totalReleased = released.size();

        // Lấy số dư ví admin
        User admin = userRepo.findByEmail(ADMIN_COMMISSION_EMAIL).orElse(null);
        BigDecimal adminBalance = admin != null ? safeBalance(admin) : BigDecimal.ZERO;

        java.util.Map<String, Object> stats = new java.util.LinkedHashMap<>();
        stats.put("totalCommissionEarned", totalCommission);
        stats.put("totalReleasedEscrows", totalReleased);
        stats.put("commissionRate", COMMISSION_RATE);
        stats.put("adminWalletBalance", adminBalance);
        stats.put("recentCommissions", released.stream()
                .sorted((a, b) -> {
                    if (b.getReleasedAt() == null && a.getReleasedAt() == null) return 0;
                    if (b.getReleasedAt() == null) return -1;
                    if (a.getReleasedAt() == null) return 1;
                    return b.getReleasedAt().compareTo(a.getReleasedAt());
                })
                .limit(20)
                .map(e -> {
                    java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
                    m.put("escrowId", e.getId());
                    m.put("requestId", e.getRequest().getId());
                    m.put("requestTitle", e.getRequest().getTitle());
                    m.put("amount", e.getAmount());
                    m.put("commissionAmount", e.getCommissionAmount());
                    m.put("netAmount", e.getNetAmount());
                    m.put("contractorName", e.getContractor().getFullName());
                    m.put("customerName", e.getCustomer().getFullName());
                    m.put("releasedAt", e.getReleasedAt());
                    return m;
                })
                .toList());
        return stats;
    }

    // ─────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────

    /**
     * Giải ngân: nhà thầu nhận netAmount, admin nhận commissionAmount.
     * Nếu commissionAmount == 0 (escrow cũ không có field) thì tính lại.
     */
    private void doRelease(Escrow escrow) {
        BigDecimal amount = escrow.getAmount();

        // Tính lại commission nếu chưa có (dữ liệu cũ)
        BigDecimal commission = escrow.getCommissionAmount();
        if (commission == null || commission.compareTo(BigDecimal.ZERO) == 0) {
            commission = amount.multiply(COMMISSION_RATE).setScale(0, RoundingMode.HALF_UP);
            escrow.setCommissionAmount(commission);
            escrow.setCommissionRate(COMMISSION_RATE);
        }
        BigDecimal net = amount.subtract(commission);
        if (escrow.getNetAmount() == null || escrow.getNetAmount().compareTo(BigDecimal.ZERO) == 0) {
            escrow.setNetAmount(net);
        } else {
            net = escrow.getNetAmount();
        }

        // Chuyển netAmount vào ví nhà thầu
        User contractor = escrow.getContractor();
        contractor.setWalletBalance(safeBalance(contractor).add(net));
        userRepo.save(contractor);
        walletService.logTransaction(contractor, net, "ESCROW_RELEASE",
                "Nhận tiền giải ngân đơn hàng #" + escrow.getRequest().getId()
                + " — sau khi trừ hoa hồng " + fmt(commission) + " (5%)");

        // Chuyển commission vào ví admin
        User admin = userRepo.findByEmail(ADMIN_COMMISSION_EMAIL)
                .orElse(null);
        if (admin != null) {
            admin.setWalletBalance(safeBalance(admin).add(commission));
            userRepo.save(admin);
            walletService.logTransaction(admin, commission, "COMMISSION",
                    "Hoa hồng 5% từ đơn hàng #" + escrow.getRequest().getId()
                    + " — " + escrow.getCustomer().getFullName()
                    + " → " + escrow.getContractor().getFullName()
                    + " — Tổng đơn: " + fmt(amount));
        }

        escrow.setStatus(EscrowStatus.RELEASED);
        escrow.setReleasedAt(LocalDateTime.now());
        escrowRepository.save(escrow);
    }

    /**
     * Hoàn tiền TOÀN BỘ cho khách (không trừ hoa hồng khi khiếu nại thành công).
     * Nếu payment = MOCK → ghi log nhưng không cộng ví (mock không có tiền thật).
     * Nếu payment = WALLET/VNPAY → hoàn tiền vào ví.
     */
    private void doRefund(Escrow escrow, String adminNotes) {
        User customer = escrow.getCustomer();
        BigDecimal refundAmount = escrow.getAmount();
        String payMethod = escrow.getPaymentMethod();

        if (!"MOCK".equalsIgnoreCase(payMethod)) {
            // Hoàn tiền thật vào ví khách
            customer.setWalletBalance(safeBalance(customer).add(refundAmount));
            userRepo.save(customer);
            walletService.logTransaction(customer, refundAmount, "ESCROW_REFUND",
                    "Hoàn tiền đầy đủ từ đơn hàng #" + escrow.getRequest().getId()
                    + " — Lý do: " + (adminNotes != null ? adminNotes : escrow.getDisputeReason()));
        }

        escrow.setStatus(EscrowStatus.REFUNDED);
        escrow.setRefundedAt(LocalDateTime.now());
        escrowRepository.save(escrow);
    }

    private Escrow getEscrowOrThrow(Long requestId) {
        return escrowRepository.findByRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy escrow cho yêu cầu #" + requestId));
    }

    private void checkStatus(Escrow escrow, EscrowStatus expected, String action) {
        if (escrow.getStatus() != expected)
            throw new RuntimeException("Không thể " + action + ": escrow đang ở trạng thái " + escrow.getStatus());
    }

    private void setRequestStatus(Escrow escrow, CustomOrderRequest.Status status) {
        CustomOrderRequest req = escrow.getRequest();
        req.setStatus(status);
        requestRepo.save(req);
    }

    private BigDecimal safeBalance(User user) {
        return user.getWalletBalance() != null ? user.getWalletBalance() : BigDecimal.ZERO;
    }

    private String fmt(BigDecimal v) {
        return String.format("%,.0f đ", v);
    }
}
