package com.example.backend.service;

import com.example.backend.entity.*;
import com.example.backend.repository.CustomOrderRequestRepository;
import com.example.backend.repository.EscrowRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class EscrowService {

    @Autowired
    private EscrowRepository escrowRepository;

    @Autowired
    private CustomOrderRequestRepository requestRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private WalletService walletService;

    public Escrow createEscrow(CustomOrderRequest request, CustomOrderQuote quote) {
        // Xóa escrow cũ cho request này nếu có (ví dụ reset lại hoặc đè lên)
        escrowRepository.findByRequestId(request.getId()).ifPresent(e -> escrowRepository.delete(e));

        Escrow escrow = new Escrow();
        escrow.setRequest(request);

        User customer = userRepo.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin khách hàng"));
        User contractor = userRepo.findById(quote.getContractorId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin nhà thầu"));

        escrow.setCustomer(customer);
        escrow.setContractor(contractor);
        escrow.setAmount(quote.getQuotedPrice());
        escrow.setStatus(EscrowStatus.PENDING);

        return escrowRepository.save(escrow);
    }

    public Escrow getEscrowByRequestId(Long requestId) {
        return escrowRepository.findByRequestId(requestId).orElse(null);
    }

    public Escrow depositMock(Long requestId) {
        Escrow escrow = escrowRepository.findByRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin tạm giữ của yêu cầu #" + requestId));

        if (escrow.getStatus() != EscrowStatus.PENDING) {
            throw new RuntimeException("Thực thể Escrow không ở trạng thái PENDING");
        }

        escrow.setStatus(EscrowStatus.HELD);
        escrow.setPaymentMethod("MOCK");
        escrowRepository.save(escrow);

        CustomOrderRequest req = escrow.getRequest();
        req.setStatus(CustomOrderRequest.Status.IN_PROGRESS);
        requestRepo.save(req);

        return escrow;
    }

    public Escrow depositWithWallet(Long requestId, Long customerId) {
        Escrow escrow = escrowRepository.findByRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin tạm giữ của yêu cầu #" + requestId));

        if (escrow.getStatus() != EscrowStatus.PENDING) {
            throw new RuntimeException("Thực thể Escrow không ở trạng thái PENDING");
        }

        if (!escrow.getCustomer().getId().equals(customerId)) {
            throw new RuntimeException("Bạn không có quyền thực hiện giao dịch cho yêu cầu này");
        }

        User customer = escrow.getCustomer();
        BigDecimal balance = customer.getWalletBalance() != null ? customer.getWalletBalance() : BigDecimal.ZERO;

        if (balance.compareTo(escrow.getAmount()) < 0) {
            throw new RuntimeException("Số dư ví không đủ để đặt cọc tạm giữ. Vui lòng nạp thêm tiền.");
        }

        // Trừ tiền trong ví khách hàng
        customer.setWalletBalance(balance.subtract(escrow.getAmount()));
        userRepo.save(customer);

        // Ghi nhận nhật ký trừ tiền ví
        walletService.logTransaction(
                customer,
                escrow.getAmount().negate(),
                "ESCROW_DEPOSIT",
                "Đặt cọc tạm giữ bằng số dư ví cho yêu cầu thiết kế #" + requestId
        );

        escrow.setStatus(EscrowStatus.HELD);
        escrow.setPaymentMethod("WALLET");
        escrowRepository.save(escrow);

        CustomOrderRequest req = escrow.getRequest();
        req.setStatus(CustomOrderRequest.Status.IN_PROGRESS);
        requestRepo.save(req);

        return escrow;
    }

    public Escrow processVNPayCallbackSuccess(Long requestId) {
        Escrow escrow = escrowRepository.findByRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin tạm giữ của yêu cầu #" + requestId));

        if (escrow.getStatus() == EscrowStatus.PENDING) {
            escrow.setStatus(EscrowStatus.HELD);
            escrow.setPaymentMethod("VNPAY");
            escrowRepository.save(escrow);

            CustomOrderRequest req = escrow.getRequest();
            req.setStatus(CustomOrderRequest.Status.IN_PROGRESS);
            requestRepo.save(req);
        }

        return escrow;
    }

    public CustomOrderRequest markShipped(Long requestId, Long contractorId) {
        Escrow escrow = escrowRepository.findByRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin tạm giữ của yêu cầu #" + requestId));

        if (!escrow.getContractor().getId().equals(contractorId)) {
            throw new RuntimeException("Bạn không phải là nhà thầu chịu trách nhiệm cho yêu cầu này");
        }

        CustomOrderRequest req = escrow.getRequest();
        if (req.getStatus() != CustomOrderRequest.Status.IN_PROGRESS) {
            throw new RuntimeException("Đơn hàng phải ở trạng thái Đang thực hiện (IN_PROGRESS)");
        }

        req.setStatus(CustomOrderRequest.Status.COMPLETED_BY_CONTRACTOR);
        return requestRepo.save(req);
    }

    public Escrow releaseEscrow(Long requestId, Long customerId) {
        Escrow escrow = escrowRepository.findByRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin tạm giữ"));

        if (!escrow.getCustomer().getId().equals(customerId)) {
            throw new RuntimeException("Bạn không có quyền giải ngân cho yêu cầu này");
        }

        if (escrow.getStatus() != EscrowStatus.HELD && escrow.getStatus() != EscrowStatus.DISPUTED) {
            throw new RuntimeException("Giao dịch tạm giữ không nằm ở trạng thái HELD hoặc DISPUTED");
        }

        escrow.setStatus(EscrowStatus.RELEASED);
        escrow.setReleasedAt(LocalDateTime.now());
        escrowRepository.save(escrow);

        CustomOrderRequest req = escrow.getRequest();
        req.setStatus(CustomOrderRequest.Status.COMPLETED);
        requestRepo.save(req);

        // Giải ngân tiền vào ví Nhà thầu
        User contractor = escrow.getContractor();
        BigDecimal currentBalance = contractor.getWalletBalance() != null ? contractor.getWalletBalance() : BigDecimal.ZERO;
        contractor.setWalletBalance(currentBalance.add(escrow.getAmount()));
        userRepo.save(contractor);

        // Ghi nhận nhật ký giải ngân ví
        walletService.logTransaction(
                contractor,
                escrow.getAmount(),
                "ESCROW_RELEASE",
                "Nhận tiền giải ngân từ yêu cầu thiết kế #" + requestId
        );

        return escrow;
    }

    public Escrow disputeEscrow(Long requestId, Long customerId, String reason) {
        Escrow escrow = escrowRepository.findByRequestId(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin tạm giữ"));

        if (!escrow.getCustomer().getId().equals(customerId)) {
            throw new RuntimeException("Bạn không có quyền mở tranh chấp cho yêu cầu này");
        }

        if (escrow.getStatus() != EscrowStatus.HELD) {
            throw new RuntimeException("Chỉ có thể khiếu nại khi tiền đang được tạm giữ (HELD)");
        }

        escrow.setStatus(EscrowStatus.DISPUTED);
        escrow.setDisputeReason(reason);
        escrowRepository.save(escrow);

        CustomOrderRequest req = escrow.getRequest();
        req.setStatus(CustomOrderRequest.Status.DISPUTED);
        requestRepo.save(req);

        return escrow;
    }

    public List<Escrow> getAllEscrows() {
        return escrowRepository.findAll();
    }

    public Escrow resolveDispute(Long escrowId, String resolution, String notes) {
        Escrow escrow = escrowRepository.findById(escrowId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin tạm giữ với ID: " + escrowId));

        if (escrow.getStatus() != EscrowStatus.DISPUTED) {
            throw new RuntimeException("Giao dịch tạm giữ này không xảy ra tranh chấp");
        }

        escrow.setDisputeResolution(notes);
        CustomOrderRequest req = escrow.getRequest();

        if ("RELEASE".equalsIgnoreCase(resolution)) {
            escrow.setStatus(EscrowStatus.RELEASED);
            escrow.setReleasedAt(LocalDateTime.now());

            req.setStatus(CustomOrderRequest.Status.COMPLETED);
            requestRepo.save(req);

            User contractor = escrow.getContractor();
            BigDecimal currentBalance = contractor.getWalletBalance() != null ? contractor.getWalletBalance() : BigDecimal.ZERO;
            contractor.setWalletBalance(currentBalance.add(escrow.getAmount()));
            userRepo.save(contractor);

            // Ghi nhật ký
            walletService.logTransaction(
                    contractor,
                    escrow.getAmount(),
                    "ESCROW_RELEASE",
                    "Nhận tiền giải ngân từ phân xử tranh chấp yêu cầu #" + req.getId()
            );

        } else if ("REFUND".equalsIgnoreCase(resolution)) {
            escrow.setStatus(EscrowStatus.REFUNDED);
            escrow.setRefundedAt(LocalDateTime.now());

            req.setStatus(CustomOrderRequest.Status.CANCELLED);
            requestRepo.save(req);

            // Hoàn tiền vào ví khách hàng
            User customer = escrow.getCustomer();
            BigDecimal currentBalance = customer.getWalletBalance() != null ? customer.getWalletBalance() : BigDecimal.ZERO;
            customer.setWalletBalance(currentBalance.add(escrow.getAmount()));
            userRepo.save(customer);

            // Ghi nhật ký
            walletService.logTransaction(
                    customer,
                    escrow.getAmount(),
                    "ESCROW_REFUND",
                    "Nhận tiền hoàn trả từ phân xử tranh chấp yêu cầu #" + req.getId()
            );
        } else {
            throw new RuntimeException("Quyết định phân xử không hợp lệ: " + resolution);
        }

        return escrowRepository.save(escrow);
    }
}
