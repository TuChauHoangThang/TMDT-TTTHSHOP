package com.example.backend.controller;

import com.example.backend.dto.auth.AuthResponse;
import com.example.backend.dto.auth.LoginRequest;
import com.example.backend.dto.auth.RegisterRequest;
import com.example.backend.dto.auth.RegisterContractorRequest;
import com.example.backend.entity.User;
import com.example.backend.entity.Role;
import com.example.backend.entity.Shop; // <-- ĐÃ THÊM IMPORT SHOP
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.ShopRepository; // <-- ĐÃ THÊM IMPORT SHOP REPOSITORY
import com.example.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ShopRepository shopRepository; // <-- ĐÃ THÊM BIẾN SHOP REPOSITORY

    // Cập nhật lại Constructor để Spring tự động tiêm (Inject) thêm ShopRepository vào
    public AuthController(AuthService authService, UserRepository userRepository, PasswordEncoder passwordEncoder, ShopRepository shopRepository) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.shopRepository = shopRepository; // <-- ĐÃ THÊM GAN BIẾN
    }

    @GetMapping("/reset-admin")
    public ResponseEntity<?> resetAdmin() {
        try {
            User u1 = userRepository.findByEmail("admin@test.com").orElse(null);
            if (u1 == null) {
                u1 = new User();
                u1.setEmail("admin@test.com");
                u1.setFullName("Admin TTTH");
                u1.setPhone("0900000001");
                u1.setRole(Role.ADMIN);
                u1.setActive(true);
            }
            u1.setPassword(passwordEncoder.encode("Admin@123"));
            userRepository.save(u1);

            User u2 = userRepository.findByEmail("admin2@ttth.vn").orElse(null);
            if (u2 == null) {
                u2 = new User();
                u2.setEmail("admin2@ttth.vn");
                u2.setFullName("Nguyễn Quản Trị");
                u2.setPhone("0900000002");
                u2.setRole(Role.ADMIN);
                u2.setActive(true);
            }
            u2.setPassword(passwordEncoder.encode("Admin@123"));
            userRepository.save(u2);

            User u3 = userRepository.findByEmail("admin3@ttth.vn").orElse(null);
            if (u3 == null) {
                u3 = new User();
                u3.setEmail("admin3@ttth.vn");
                u3.setFullName("Trần Hệ Thống");
                u3.setPhone("0900000003");
                u3.setRole(Role.ADMIN);
                u3.setActive(true);
            }
            u3.setPassword(passwordEncoder.encode("Admin@123"));
            userRepository.save(u3);

            return ResponseEntity.ok("Successfully reset admin/admin2/admin3 passwords to Admin@123!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    // ---- ĐÃ FIX LỖI: Hàm sinh tự động tài khoản CONTRACTOR test ----
    @GetMapping("/reset-seller")
    public ResponseEntity<?> resetSeller() {
        try {
            // 1. Tìm hoặc tạo tài khoản Seller trong bảng users
            User seller = userRepository.findByEmail("seller@test.com").orElse(null);
            if (seller == null) {
                seller = new User();
                seller.setEmail("seller@test.com");
                seller.setFullName("Nhà Thầu Sofa Test");
                seller.setPhone("0911223344");
                seller.setRole(Role.CONTRACTOR);
            }
            seller.setActive(true);
            seller.setPassword(passwordEncoder.encode("Seller@123"));
            User savedSeller = userRepository.save(seller);

            // 2. Tự động kiểm tra và tạo Cửa hàng đi kèm cho Contractor này
            boolean hasShop = shopRepository.findByOwnerId(savedSeller.getId()).isPresent();
            if (!hasShop) {
                Shop shop = new Shop();
                shop.setOwner(savedSeller);
                shop.setName("Xưởng Nội Thất Sofa Test");
                shop.setSlug("xuong-noi-that-sofa-test-" + System.currentTimeMillis());
                shop.setAddress("123 Đường Số 1, TP.HCM");
                shop.setDescription("Cửa hàng demo được tạo tự động để test hệ thống.");
                shop.setRating(java.math.BigDecimal.ZERO);
                shop.setRatingCount(0);
                shopRepository.save(shop);
            }

            return ResponseEntity.ok("Successfully reset seller password to Seller@123 and activated the account!");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = authService.register(request);
            return ResponseEntity.ok(Map.of(
                    "otpRequired", true,
                    "email", user.getEmail(),
                    "message", "Mã OTP đã được gửi đến email đăng ký của bạn. Vui lòng xác thực để kích hoạt tài khoản."
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/register-contractor")
    public ResponseEntity<?> registerContractor(@RequestBody RegisterContractorRequest request) {
        try {
            User user = authService.registerContractor(request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Đăng ký tài khoản nhà thầu thành công. Tài khoản của bạn hiện đang chờ quản trị viên xét duyệt."
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otpCode = request.get("otpCode");
            AuthResponse response = authService.verifyOtp(email, otpCode);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            authService.resendOtp(email);
            return ResponseEntity.ok(Map.of("message", "Mã OTP mới đã được gửi thành công."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            authService.sendForgotPasswordOtp(email);
            return ResponseEntity.ok(Map.of("message", "Mã OTP khôi phục mật khẩu đã được gửi đến email của bạn."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String otpCode = request.get("otpCode");
            String newPassword = request.get("newPassword");
            authService.resetPasswordWithOtp(email, otpCode, newPassword);
            return ResponseEntity.ok(Map.of("message", "Mật khẩu của bạn đã được đặt lại thành công. Vui lòng đăng nhập lại."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}