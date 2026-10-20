package com.maireposteria.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoders;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityWebFilterChain securityWebFilterChain(
            ServerHttpSecurity http,
            @Value("${gateway.security.issuer-uri:}") String issuerUri) {
        http.csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(cors -> {})
                .authorizeExchange(exchanges -> {
                    exchanges.pathMatchers("/actuator/health/**", "/fallback/**").permitAll();
                    if (issuerUri == null || issuerUri.isBlank()) {
                        exchanges.anyExchange().permitAll();
                    } else {
                        exchanges.pathMatchers("/api/v1/auth/**").permitAll();
                        exchanges.anyExchange().authenticated();
                    }
                });

        if (issuerUri != null && !issuerUri.isBlank()) {
            http.oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> {}));
        }
        return http.build();
    }

    @Bean
    ReactiveJwtDecoder jwtDecoder(@Value("${gateway.security.issuer-uri:}") String issuerUri) {
        if (issuerUri == null || issuerUri.isBlank()) {
            return token -> reactor.core.publisher.Mono.error(
                    new IllegalStateException("JWT_ISSUER_URI no está configurado"));
        }
        return ReactiveJwtDecoders.fromIssuerLocation(issuerUri);
    }
}
