package com.smartcourier.config_server;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@ActiveProfiles("native")
class ConfigServerApplicationTests {

	@Test
	void contextLoads() {
	}

	@Test
	void instantiate() {
		ConfigServerApplication application = new ConfigServerApplication();
		assertNotNull(application);
	}

	@Test
	void main() {
		ConfigServerApplication.main(new String[] {"--server.port=0"});
	}
}
