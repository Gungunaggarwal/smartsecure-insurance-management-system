package com.smartcourier.admin;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class AdminServiceApplicationTest {

    @Test
    void contextLoads() {
        // Test if the application context loads successfully
    }

    @Test
    void mainMethodTest() {
        // Test the main method entry point
        AdminServiceApplication.main(new String[] {});
    }
}
