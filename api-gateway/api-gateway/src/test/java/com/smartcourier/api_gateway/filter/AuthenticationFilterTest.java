package com.smartcourier.api_gateway.filter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationFilterTest {

    @Mock
    private RouteValidator validator;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private GatewayFilterChain chain;

    @InjectMocks
    private AuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        // Mock chain.filter to return Mono.empty()
        lenient().when(chain.filter(any(ServerWebExchange.class))).thenReturn(Mono.empty());
    }

    @Test
    void apply_WhenPublicRoute_ShouldProceed() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/auth/login").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        
        when(validator.isSecured(any())).thenReturn(false);

        filter.apply(new AuthenticationFilter.Config()).filter(exchange, chain).block();

        verify(chain, times(1)).filter(any(ServerWebExchange.class));
        verifyNoInteractions(jwtUtil);
    }

    @Test
    void apply_WhenSecuredRoute_MissingHeader_ShouldReturnUnAuthorized() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/policy/all").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        
        when(validator.isSecured(any())).thenReturn(true);

        filter.apply(new AuthenticationFilter.Config()).filter(exchange, chain).block();

        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    }

    @Test
    void apply_WhenSecuredRoute_ValidToken_ShouldProceedWithHeader() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/policy/all")
                .header(HttpHeaders.AUTHORIZATION, "Bearer valid-token")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        
        when(validator.isSecured(any())).thenReturn(true);
        when(jwtUtil.extractUsername("valid-token")).thenReturn("testuser");

        filter.apply(new AuthenticationFilter.Config()).filter(exchange, chain).block();

        verify(jwtUtil, times(1)).validateToken("valid-token");
        verify(chain, times(1)).filter(any(ServerWebExchange.class));
    }

    @Test
    void apply_WhenSecuredRoute_InvalidToken_ShouldReturnUnAuthorized() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/policy/all")
                .header(HttpHeaders.AUTHORIZATION, "Bearer invalid-token")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        
        when(validator.isSecured(any())).thenReturn(true);
        doThrow(new RuntimeException("Invalid Token")).when(jwtUtil).validateToken("invalid-token");

        filter.apply(new AuthenticationFilter.Config()).filter(exchange, chain).block();

        assertEquals(HttpStatus.UNAUTHORIZED, exchange.getResponse().getStatusCode());
    }
}
