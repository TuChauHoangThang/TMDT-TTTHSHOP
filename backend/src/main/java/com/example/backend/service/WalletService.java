package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.entity.WalletTransaction;
import com.example.backend.entity.WithdrawalRequest;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.WalletTransactionRepository;
import com.example.backend.repository.WithdrawalRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class WalletService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletTransactionRepository transactionRepo;

    @Autowired
    private WithdrawalRequestRepository withdrawalRepo;

    public void logTransaction(User user, BigDecimal amount, String type, String description) {
        WalletTransaction tx = new WalletTransaction();
        tx.setUser(user);
        tx.setAmount(amount);
        tx.setType(type);
        tx.setDescription(description);
        transactionRepo.save(tx);
    }

    public User depositMock(Long userId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền nạp phải lớn hơn 0");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        BigDecimal currentBalance = user.getWalletBalance() != null ? user.getWalletBalance() : BigDecimal.ZERO;
        user.setWalletBalance(currentBalance.add(amount));
        User savedUser = userRepository.save(user);

        logTransaction(savedUser, amount, "DEPOSIT", "Nạp tiền thử nghiệm vào ví");

        return savedUser;
    }

    public User processDepositVNPaySuccess(Long userId, BigDecimal amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        BigDecimal currentBalance = user.getWalletBalance() != null ? user.getWalletBalance() : BigDecimal.ZERO;
        user.setWalletBalance(currentBalance.add(amount));
        User savedUser = userRepository.save(user);

        logTransaction(savedUser, amount, "DEPOSIT", "Nạp tiền vào ví qua VNPay");

        return savedUser;
    }

    public WithdrawalRequest createWithdrawRequest(Long userId, BigDecimal amount, String bankName, String accountNumber, String accountHolderName) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Số tiền rút phải lớn hơn 0");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        BigDecimal currentBalance = user.getWalletBalance() != null ? user.getWalletBalance() : BigDecimal.ZERO;
        if (currentBalance.compareTo(amount) < 0) {
            throw new RuntimeException("Số dư ví khả dụng không đủ");
        }

        // Khóa số tiền rút: Trừ thẳng số dư ví khả dụng ngay khi yêu cầu rút
        user.setWalletBalance(currentBalance.subtract(amount));
        userRepository.save(user);

        WithdrawalRequest request = new WithdrawalRequest();
        request.setUser(user);
        request.setAmount(amount);
        request.setBankName(bankName);
        request.setAccountNumber(accountNumber);
        request.setAccountHolderName(accountHolderName);
        request.setStatus(WithdrawalRequest.Status.PENDING);

        return withdrawalRepo.save(request);
    }

    public WithdrawalRequest approveWithdrawal(Long requestId) {
        WithdrawalRequest req = withdrawalRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu rút tiền"));

        if (req.getStatus() != WithdrawalRequest.Status.PENDING) {
            throw new RuntimeException("Yêu cầu rút tiền không ở trạng thái PENDING");
        }

        req.setStatus(WithdrawalRequest.Status.APPROVED);
        req.setProcessedAt(LocalDateTime.now());
        WithdrawalRequest saved = withdrawalRepo.save(req);

        // Ghi nhật ký trừ tiền ví vĩnh viễn
        logTransaction(
            req.getUser(), 
            req.getAmount().negate(), 
            "WITHDRAWAL", 
            "Rút tiền về tài khoản ngân hàng " + req.getBankName() + " (" + req.getAccountNumber() + ") - Phê duyệt thành công"
        );

        return saved;
    }

    public WithdrawalRequest rejectWithdrawal(Long requestId) {
        WithdrawalRequest req = withdrawalRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu rút tiền"));

        if (req.getStatus() != WithdrawalRequest.Status.PENDING) {
            throw new RuntimeException("Yêu cầu rút tiền không ở trạng thái PENDING");
        }

        req.setStatus(WithdrawalRequest.Status.REJECTED);
        req.setProcessedAt(LocalDateTime.now());
        WithdrawalRequest saved = withdrawalRepo.save(req);

        // Hoàn trả lại số tiền đã bị khóa vào số dư ví khả dụng
        User user = req.getUser();
        BigDecimal currentBalance = user.getWalletBalance() != null ? user.getWalletBalance() : BigDecimal.ZERO;
        user.setWalletBalance(currentBalance.add(req.getAmount()));
        userRepository.save(user);

        // Ghi nhật ký hoàn trả tiền bị khóa
        logTransaction(
            user, 
            req.getAmount(), 
            "DEPOSIT", 
            "Hoàn trả tiền tạm khóa do yêu cầu rút tiền bị từ chối"
        );

        return saved;
    }

    @Transactional(readOnly = true)
    public List<WalletTransaction> getTransactionHistory(Long userId) {
        return transactionRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<WithdrawalRequest> getMyWithdrawalRequests(Long userId) {
        return withdrawalRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<WithdrawalRequest> getAllWithdrawalRequests() {
        return withdrawalRepo.findAll();
    }
}
