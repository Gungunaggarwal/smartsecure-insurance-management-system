package com.smartcourier.auth.service;

import com.smartcourier.auth.exception.AuthException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${otp.expiry.minutes:10}")
    private int otpExpiryMinutes;

    // In-memory store: email -> [otp, expiry]
    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    private static final SecureRandom RANDOM = new SecureRandom();

    // ─── Generate & Send OTP ─────────────────────────────────────────────────
    public void sendOtp(String email) {
        String otp = String.format("%06d", RANDOM.nextInt(999999));
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(otpExpiryMinutes);
        otpStore.put(email, new OtpEntry(otp, expiry));

        log.info("Sending OTP to email: {}", email);
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(email);
            message.setSubject("SmartSecure – Your OTP Verification Code");
            message.setText(
                "Hello,\n\n" +
                "Your SmartSecure registration OTP is:\n\n" +
                "  " + otp + "\n\n" +
                "This code is valid for " + otpExpiryMinutes + " minutes.\n" +
                "Do not share this code with anyone.\n\n" +
                "– SmartSecure Team"
            );
            mailSender.send(message);
            log.info("OTP sent successfully to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}. Error: {}", email, e.getMessage());
            throw new AuthException("Failed to send OTP email. Please ensure your email configuration is correct.");
        }
    }

    // ─── Verify OTP ──────────────────────────────────────────────────────────
    public boolean verifyOtp(String email, String otp) {
        OtpEntry entry = otpStore.get(email);
        if (entry == null) {
            log.warn("OTP verification failed: no OTP found for email {}", email);
            return false;
        }
        if (LocalDateTime.now().isAfter(entry.expiry())) {
            otpStore.remove(email);
            log.warn("OTP expired for email: {}", email);
            return false;
        }
        boolean match = entry.otp().equals(otp);
        if (match) {
            otpStore.remove(email); // OTP consumed
            log.info("OTP verified successfully for email: {}", email);
        } else {
            log.warn("OTP mismatch for email: {}", email);
        }
        return match;
    }

    // ─── Inner record ────────────────────────────────────────────────────────
    private record OtpEntry(String otp, LocalDateTime expiry) {}
}
