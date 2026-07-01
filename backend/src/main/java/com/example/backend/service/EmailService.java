package com.example.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otpCode) {
        String subject = "Mã xác thực OTP đăng ký tài khoản - TTTH Furniture";
        String content = "Chào bạn,\n\n"
                + "Cảm ơn bạn đã đăng ký tài khoản tại TTTH Furniture. "
                + "Mã OTP xác thực tài khoản của bạn là: " + otpCode + "\n"
                + "Mã OTP này có hiệu lực trong vòng 5 phút.\n\n"
                + "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.\n\n"
                + "Trân trọng,\n"
                + "TTTH Furniture Support Team";

        logger.info("=========================================");
        logger.info("   [GỬI OTP EMAIL THỬ NGHIỆM]");
        logger.info("   Đến: {}", toEmail);
        logger.info("   Mã OTP kích hoạt: {}", otpCode);
        logger.info("=========================================");

        try {
            if (mailSender == null) {
                logger.warn("JavaMailSender chưa được cấu hình. Sử dụng mã OTP ở log trên để tiếp tục đăng ký.");
                return;
            }
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);
            logger.info("Email OTP đã được gửi thành công đến {}", toEmail);
        } catch (Exception e) {
            logger.error("Lỗi khi gửi email đến {}: {}", toEmail, e.getMessage());
            logger.warn("Vui lòng kiểm tra lại cấu hình Gmail trong application.properties. Bạn có thể sử dụng mã OTP ở log trên để tiếp tục đăng ký.");
        }
    }

    public void sendForgotPasswordOtpEmail(String toEmail, String otpCode) {
        String subject = "Mã xác thực OTP đặt lại mật khẩu - TTTH Furniture";
        String content = "Chào bạn,\n\n"
                + "Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản tại TTTH Furniture. "
                + "Mã OTP xác thực đặt lại mật khẩu của bạn là: " + otpCode + "\n"
                + "Mã OTP này có hiệu lực trong vòng 5 phút.\n\n"
                + "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này để bảo vệ tài khoản.\n\n"
                + "Trân trọng,\n"
                + "TTTH Furniture Support Team";

        logger.info("=========================================");
        logger.info("   [GỬI OTP ĐẶT LẠI MẬT KHẨU THỬ NGHIỆM]");
        logger.info("   Đến: {}", toEmail);
        logger.info("   Mã OTP khôi phục: {}", otpCode);
        logger.info("=========================================");

        try {
            if (mailSender == null) {
                logger.warn("JavaMailSender chưa được cấu hình. Sử dụng mã OTP ở log trên để khôi phục mật khẩu.");
                return;
            }
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);
            logger.info("Email OTP đặt lại mật khẩu đã được gửi thành công đến {}", toEmail);
        } catch (Exception e) {
            logger.error("Lỗi khi gửi email đặt lại mật khẩu đến {}: {}", toEmail, e.getMessage());
            logger.warn("Vui lòng kiểm tra lại cấu hình Gmail trong application.properties. Bạn có thể sử dụng mã OTP ở log trên để khôi phục mật khẩu.");
        }
    }
}
