package com.trustpay.backend.controller;

import com.trustpay.backend.dto.AuthRequest;
import com.trustpay.backend.model.User;
import com.trustpay.backend.repository.UserRepository;
import com.trustpay.backend.security.JwtUtils;
import lombok.RequiredArgsConstructor;
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
}
