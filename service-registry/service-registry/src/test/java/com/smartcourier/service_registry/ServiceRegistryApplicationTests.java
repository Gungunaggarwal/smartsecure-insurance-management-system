package com.smartcourier.service_registry;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@ActiveProfiles("test")
class ServiceRegistryApplicationTests {

	@Test
	void contextLoads() {
		// Verifies that the Eureka Server context starts correctly
	}

	@Test
	void mainMethodTest() {
		System.setProperty("server.port", "0");
		ServiceRegistryApplication.main(new String[] {});
	}
}
