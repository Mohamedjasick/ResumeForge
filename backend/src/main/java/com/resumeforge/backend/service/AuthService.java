package com.resumeforge.backend.service;

import com.resumeforge.backend.dto.request.LoginRequest;
import com.resumeforge.backend.dto.request.RegisterRequest;
import com.resumeforge.backend.dto.response.AuthResponse;
import com.resumeforge.backend.entity.User;
import com.resumeforge.backend.repository.UserRepository;
import com.resumeforge.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Auto-generate a unique username from the email prefix so the
        // users table (which has username NOT NULL) stays valid — no need
        // to ask the user for one anymore.
        // e.g. "mohamed@gmail.com" → "mohamed", or "mohamed_1" if taken
        String baseUsername = request.getEmail().split("@")[0]
                .replaceAll("[^a-zA-Z0-9_]", "_"); // sanitize special chars
        String username = baseUsername;
        int suffix = 1;
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + "_" + suffix++;
        }

        User user = User.builder()
                .username(username)
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getEmail(), saved.getId());

        return AuthResponse.builder()
                .token(token)
                .email(saved.getEmail())
                .username(saved.getUsername())
                .userId(saved.getId())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .username(user.getUsername())
                .userId(user.getId())
                .build();
    }
}