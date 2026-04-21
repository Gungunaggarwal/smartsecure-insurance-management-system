package com.smartcourier.api_gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import reactor.core.publisher.Mono;

import java.util.Arrays;

@SpringBootApplication(exclude = {UserDetailsServiceAutoConfiguration.class})
public class ApiGatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiGatewayApplication.class, args);
	}

	@Bean
	public GlobalFilter requestTraceFilter() {
		return (exchange, chain) -> {
			System.out.println(">>> GATEWAY RECEIVED REQUEST: " + exchange.getRequest().getMethod() + " " + exchange.getRequest().getPath());
			return chain.filter(exchange).then(Mono.fromRunnable(() -> 
				System.out.println("<<< GATEWAY SENT RESPONSE: " + exchange.getResponse().getStatusCode())
			));
		};
	}

}
