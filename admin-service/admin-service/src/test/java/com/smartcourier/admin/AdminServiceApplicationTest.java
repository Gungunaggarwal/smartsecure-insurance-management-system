package com.smartcourier.admin;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class AdminServiceApplicationTest {
    @org.springframework.boot.test.mock.mockito.MockBean
    private org.springframework.amqp.rabbit.core.RabbitTemplate rabbitTemplate;


    @Test
    void contextLoads() {
        // Simple test to ensure application context starts
    }
}
