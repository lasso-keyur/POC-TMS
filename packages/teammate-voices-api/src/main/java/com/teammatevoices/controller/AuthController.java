package com.teammatevoices.controller;

import com.teammatevoices.dto.request.LoginRequest;
import com.teammatevoices.dto.request.RefreshRequest;
import com.teammatevoices.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        log.info("POST /auth/login - {}", request.email());
        Map<String, Object> result = authService.login(request.email(), request.password());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(@Valid @RequestBody RefreshRequest request) {
        log.info("POST /auth/refresh");
        Map<String, Object> result = authService.refresh(request.refreshToken());
        return ResponseEntity.ok(result);
    }
}
