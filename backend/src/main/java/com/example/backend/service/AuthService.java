package com.example.backend.service;

import com.example.backend.dto.auth.AuthResponse;
import com.example.backend.dto.auth.LoginRequest;
import com.example.backend.dto.auth.RegisterRequest;
import com.example.backend.dto.auth.RegisterContractorRequest;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.entity.Shop;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.ShopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Random;
import java.math.BigDecimal;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ShopRepository shopRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, ShopRepository shopRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
        this.userRepository = userRepository;
        this.shopRepository = shopRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public User register(RegisterRequest request) {
        java.util.Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            User u = existingUser.get();
            if (u.isActive()) {
                throw new RuntimeException("Email đã được sử dụng!");
            } else {
                userRepository.delete(u);
            }
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.CUSTOMER);
        user.setActive(false);

        // Sinh mã OTP 6 chữ số ngẫu nhiên
        String otpCode = String.format("%06d", new Random().nextInt(1000000));
        user.setOtpCode(otpCode);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        userRepository.save(user);

        // Gửi email chứa OTP
        emailService.sendOtpEmail(user.getEmail(), otpCode);

        return user;
    }

    public User registerContractor(RegisterContractorRequest request) {
        java.util.Optional<User> existingUser = userRepository.findByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            User u = existingUser.get();
            if (u.isActive()) {
                throw new RuntimeException("Email đã được sử dụng!");
            } else {
                shopRepository.findByOwnerId(u.getId()).ifPresent(shop -> shopRepository.delete(shop));
                userRepository.delete(u);
            }
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.CONTRACTOR);
        user.setActive(false); // Cần Admin duyệt kích hoạt

        userRepository.save(user);

        Shop shop = new Shop();
        shop.setOwner(user);
        shop.setName(request.getShopName());
        shop.setSlug(generateSlug(request.getShopName()));
        shop.setDescription(request.getShopDescription());
        shop.setAddress(request.getShopAddress());
        shop.setRating(BigDecimal.ZERO);
        shop.setRatingCount(0);
        shopRepository.save(shop);

        // Gửi email thông báo hồ sơ đang chờ xét duyệt
        emailService.sendContractorRegistrationEmail(user.getEmail(), user.getFullName(), shop.getName());

        return user;
    }

    private String generateSlug(String input) {
        if (input == null || input.isBlank()) {
            return "shop-" + System.currentTimeMillis();
        }
        String temp = input.toLowerCase()
            .replaceAll("[áàảãạăắằẳẵặâấầẩẫậ]", "a")
            .replaceAll("[éèẻẽẹêếềểễệ]", "e")
            .replaceAll("[íìỉĩị]", "i")
            .replaceAll("[óòỏõọôốồổỗộơớờởỡợ]", "o")
            .replaceAll("[úùủũụưứừửữự]", "u")
            .replaceAll("[ýỳỷỹỵ]", "y")
            .replaceAll("đ", "d")
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-")
            .trim();
        return temp + "-" + System.currentTimeMillis();
    }

    public AuthResponse verifyOtp(String email, String otpCode) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin tài khoản!"));

        if (user.isActive()) {
            throw new RuntimeException("Tài khoản này đã được kích hoạt trước đó!");
        }

        if (user.getOtpCode() == null || !user.getOtpCode().equals(otpCode)) {
            throw new RuntimeException("Mã OTP không chính xác!");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã OTP đã hết hạn! Vui lòng nhấn gửi lại.");
        }

        // Kích hoạt tài khoản
        user.setActive(true);
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        // Đăng nhập tự động khi kích hoạt thành công
        String token = "fake-jwt-token-for-" + user.getEmail();
        AuthResponse.UserResponse userDto = new AuthResponse.UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                null
        );

        return new AuthResponse(token, userDto);
    }

    public void resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản!"));

        if (user.isActive()) {
            throw new RuntimeException("Tài khoản này đã được kích hoạt thành công!");
        }

        String newOtpCode = String.format("%06d", new Random().nextInt(1000000));
        user.setOtpCode(newOtpCode);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), newOtpCode);
    }

    public void sendForgotPasswordOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này!"));

        String otpCode = String.format("%06d", new Random().nextInt(1000000));
        user.setOtpCode(otpCode);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        emailService.sendForgotPasswordOtpEmail(user.getEmail(), otpCode);
    }

    public void resetPasswordWithOtp(String email, String otpCode, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với email này!"));

        if (user.getOtpCode() == null || !user.getOtpCode().equals(otpCode)) {
            throw new RuntimeException("Mã OTP không chính xác!");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Mã OTP đã hết hạn! Vui lòng yêu cầu gửi lại mã mới.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        user.setActive(true);
        userRepository.save(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email hoặc mật khẩu không đúng!"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email hoặc mật khẩu không đúng!");
        }

        if (!user.isActive()) {
            throw new RuntimeException("Tài khoản của bạn đã bị vô hiệu hoá.");
        }

        String token = "fake-jwt-token-for-" + user.getEmail();

        Long shopId = null;
        if (user.getRole() == Role.CONTRACTOR) {
            shopId = shopRepository.findByOwnerId(user.getId())
                    .map(s -> s.getId())
                    .orElse(null);
        }

        AuthResponse.UserResponse userDto = new AuthResponse.UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                shopId
        );

        return new AuthResponse(token, userDto);
    }
}