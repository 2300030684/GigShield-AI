package com.trustpay.backend.controller;

import com.trustpay.backend.dto.AuthRequest;
import com.trustpay.backend.model.User;
import com.trustpay.backend.repository.UserRepository;
import com.trustpay.backend.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("ROLE_WORKER");
        
        // ── [DEMO MODE] OTP Simulation ──
        // ⚠️  In production: replace with SMS gateway (Twilio/MSG91)
        String otp = String.format("%06d", new java.util.Random().nextInt(1000000));
        log.info("[DEMO-OTP] ══════════════════════════════════════════");
        log.info("[DEMO-OTP] TrustPay OTP for @{}: {}", user.getUsername(), otp);
        log.info("[DEMO-OTP] ══════════════════════════════════════════");
        user.setOtp(otp);

        return ResponseEntity.ok(userRepository.save(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        String loginId = request.getIdentifier() != null ? request.getIdentifier() : 
                         (request.getEmail() != null ? request.getEmail() : request.getUsername());

        return userRepository.findByUsername(loginId)
                .or(() -> userRepository.findByEmail(loginId))
                .filter(user -> passwordEncoder.matches(request.getPassword(), user.getPassword()))
                .map(user -> {
                    String token = jwtUtils.generateTokenFromUsername(user.getUsername());
                    Map<String, Object> response = new HashMap<>();
                    response.put("token", token);
                    response.put("user", user);
                    return ResponseEntity.ok((Object) response);
                })
                .orElseGet(() -> {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Invalid credentials");
                    return ResponseEntity.status(401).body(error);
                });
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .map(user -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("user", user);
                    
                    Map<String, Object> policy = new HashMap<>();
                    policy.put("planName", "Standard Coverage");
                    policy.put("status", "ACTIVE");
                    response.put("policy", policy);
                    
                    return ResponseEntity.ok((Object) response);
                })
                .orElse(ResponseEntity.status(404).build());
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@RequestBody Map<String, Object> updates) {
        String username = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .map(user -> {
                    if (updates.containsKey("name")) user.setName((String) updates.get("name"));
                    if (updates.containsKey("phone")) user.setPhone((String) updates.get("phone"));
                    if (updates.containsKey("email")) user.setEmail((String) updates.get("email"));
                    if (updates.containsKey("city")) user.setCity((String) updates.get("city"));
                    if (updates.containsKey("platform")) user.setPlatform((String) updates.get("platform"));
                    if (updates.containsKey("vehicleType")) user.setVehicleType((String) updates.get("vehicleType"));
                    
                    if (updates.containsKey("upiId")) user.setUpiId((String) updates.get("upiId"));
                    else if (updates.containsKey("upiID")) user.setUpiId((String) updates.get("upiID"));

                    if (updates.containsKey("panNumber")) user.setPanNumber((String) updates.get("panNumber"));
                    
                    // Auto-assign workerId if missing
                    if (user.getWorkerId() == null || user.getWorkerId().isEmpty()) {
                        user.setWorkerId("TP-WORKER-" + user.getUsername().toUpperCase());
                    }
                    
                    if (updates.containsKey("isOnboardingComplete")) {
                         Object complete = updates.get("isOnboardingComplete");
                         if (complete instanceof Boolean) {
                             user.setIsOnboardingComplete((Boolean) complete);
                         } else if (complete instanceof String) {
                             user.setIsOnboardingComplete(Boolean.parseBoolean((String) complete));
                         }
                    }
                    
                    if (updates.containsKey("coveragePaused")) {
                        Object paused = updates.get("coveragePaused");
                        if (paused instanceof Boolean) {
                            user.setCoveragePaused((Boolean) paused);
                        } else if (paused instanceof String) {
                            user.setCoveragePaused(Boolean.parseBoolean((String) paused));
                        }
                    }
                    
                    userRepository.save(user);

                    Map<String, Object> response = new HashMap<>();
                    response.put("user", user);
                    
                    Map<String, Object> policy = new HashMap<>();
                    policy.put("planName", "Standard Coverage");
                    response.put("policy", policy);
                    
                    return ResponseEntity.ok((Object) response);
                })
                .orElse(ResponseEntity.status(404).build());
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }

    // ── DEMO ONLY: Create admin account ──
    // POST /api/auth/create-admin?secret=trustpay2026
    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(@RequestParam(defaultValue = "") String secret) {
        if (!"trustpay2026".equals(secret)) {
            return ResponseEntity.status(403).body("Forbidden");
        }
        if (userRepository.existsByUsername("admin")) {
            // Ensure existing admin has onboarding complete
            return userRepository.findByUsername("admin").map(u -> {
                u.setIsOnboardingComplete(true);
                u.setRole("ROLE_ADMIN");
                userRepository.save(u);
                String token = jwtUtils.generateTokenFromUsername(u.getUsername());
                Map<String, Object> resp = new HashMap<>();
                resp.put("token", token);
                resp.put("user", u);
                resp.put("message", "Admin already exists — returning token");
                return ResponseEntity.ok((Object) resp);
            }).orElse(ResponseEntity.status(404).build());
        }
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@trustpay.ai");
        admin.setName("TrustPay Admin");
        admin.setPassword(passwordEncoder.encode("Admin@2026"));
        admin.setRole("ROLE_ADMIN");
        admin.setIsOnboardingComplete(true);
        admin.setStatus("ACTIVE");
        User saved = userRepository.save(admin);
        String token = jwtUtils.generateTokenFromUsername(saved.getUsername());
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", saved);
        response.put("message", "Admin created: username=admin, password=Admin@2026");
        log.info("[ADMIN] Admin account created successfully");
        return ResponseEntity.ok(response);
    }
}
