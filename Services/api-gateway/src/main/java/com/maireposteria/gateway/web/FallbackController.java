package com.maireposteria.gateway.web;

import java.time.OffsetDateTime;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @GetMapping({"/users", "/catalog", "/cart"})
    public ResponseEntity<Map<String, Object>> serviceUnavailable() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                "timestamp", OffsetDateTime.now().toString(),
                "status", 503,
                "error", "SERVICE_UNAVAILABLE",
                "message", "El servicio solicitado no está disponible temporalmente"));
    }
}
