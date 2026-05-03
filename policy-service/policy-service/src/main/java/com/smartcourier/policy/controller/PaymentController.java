package com.smartcourier.policy.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    @Value("${razorpay.key.id:rzp_test_dummy_id}")
    private String keyId;

    @Value("${razorpay.key.secret:rzp_test_dummy_secret}")
    private String keySecret;

    /** Provide the Public Key ID to the frontend */
    @GetMapping("/config")
    public ResponseEntity<Map<String, String>> getConfig() {
        return ResponseEntity.ok(Map.of("keyId", keyId));
    }

    /** Create a real Razorpay Order */
    @PostMapping("/create-order")
    public ResponseEntity<String> createOrder(@RequestBody Map<String, Object> data) {
        try {
            int amount = (int) data.get("amount");
            String currency = "INR";
            String receipt = "receipt_" + System.currentTimeMillis();

            RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount * 100); // Paisa
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", receipt);

            Order order = razorpay.orders.create(orderRequest);
            log.info("Razorpay Order created: {}", order.get("id").toString());
            
            return ResponseEntity.ok(order.toString());
        } catch (RazorpayException e) {
            log.error("Razorpay Error: {}", e.getMessage());
            return ResponseEntity.status(500).body("Error creating Razorpay order: " + e.getMessage());
        }
    }

    /** Verification Endpoint (Mocked for now) */
    @PostMapping("/verify")
    public ResponseEntity<String> verifyPayment(@RequestBody Map<String, String> data) {
        // In a real app, you would use RazorpayUtils.verifyPaymentSignature(...)
        log.info("Payment verification received for order: {}", data.get("razorpay_order_id"));
        return ResponseEntity.ok("Payment Verified Successfully");
    }
}
