package com.learnerplatform.backend.service;

import com.learnerplatform.backend.dto.AuthResponse;
import com.learnerplatform.backend.dto.LoginRequest;
import com.learnerplatform.backend.dto.RegisterRequest;
import com.learnerplatform.backend.exception.BadRequestException;
import com.learnerplatform.backend.model.Learner;
import com.learnerplatform.backend.model.Role;
import com.learnerplatform.backend.model.User;
import com.learnerplatform.backend.repository.LearnerRepository;
import com.learnerplatform.backend.repository.UserRepository;
import com.learnerplatform.backend.security.JwtTokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final LearnerRepository learnerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, LearnerRepository learnerRepository,
                       PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.learnerRepository = learnerRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        log.info("Registering new user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        Role role = Role.LEARNER;
        if (request.getRole() != null) {
            try {
                role = Role.valueOf(request.getRole().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Invalid role: " + request.getRole());
            }
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);
        log.info("User registered successfully: {}", user.getEmail());

        // Auto-create a Learner profile for LEARNER role users
        if (role == Role.LEARNER) {
            String studentId = "USR-" + user.getId();
            if (!learnerRepository.existsByStudentId(studentId)) {
                Learner learner = Learner.builder()
                        .user(user)
                        .studentId(studentId)
                        .name(user.getName())
                        .email(user.getEmail())
                        .status("ACTIVE")
                        .build();
                learnerRepository.save(learner);
                log.info("Auto-created Learner profile for user: {} with studentId: {}", user.getEmail(), studentId);
            }
        }

        String token = tokenProvider.generateTokenFromEmail(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .userId(user.getId())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        log.info("User logged in successfully: {}", user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .userId(user.getId())
                .build();
    }
}
