package com.maireposteria.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "gateway.security.jwt-secret=test-secret-with-at-least-32-bytes-long")
class ApiGatewayApplicationTests {

	@Test
	void contextLoads() {
	}

}
