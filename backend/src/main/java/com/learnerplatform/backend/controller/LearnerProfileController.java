package com.learnerplatform.backend.controller;

import com.learnerplatform.backend.dto.LearnerRequest;
import com.learnerplatform.backend.dto.LearnerResponse;
import com.learnerplatform.backend.exception.ResourceNotFoundException;
import com.learnerplatform.backend.model.Learner;
import com.learnerplatform.backend.model.User;
import com.learnerplatform.backend.repository.LearnerRepository;
import com.learnerplatform.backend.repository.UserRepository;
import com.learnerplatform.backend.service.LearnerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class LearnerProfileController {

    private static final Logger log = LoggerFactory.getLogger(LearnerProfileController.class);

    private final LearnerRepository learnerRepository;
    private final UserRepository userRepository;
    private final LearnerService learnerService;

    public LearnerProfileController(LearnerRepository learnerRepository,
                                    UserRepository userRepository,
                                    LearnerService learnerService) {
        this.learnerRepository = learnerRepository;
        this.userRepository = userRepository;
        this.learnerService = learnerService;
    }

    @GetMapping("/me")
    public ResponseEntity<LearnerResponse> getMyProfile(Authentication authentication) {
        String email = authentication.getName();
        log.info("Fetching profile for: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Learner learner = learnerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Learner profile not found for user: " + email));

        return ResponseEntity.ok(learnerService.toPublicResponse(learner));
    }

    @PutMapping("/me")
    public ResponseEntity<LearnerResponse> updateMyProfile(Authentication authentication,
                                                            @RequestBody LearnerRequest request) {
        String email = authentication.getName();
        log.info("Updating profile for: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Learner learner = learnerRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Learner profile not found for user: " + email));

        // Update allowed fields (learner cannot change studentId or status themselves)
        if (request.getCourse() != null) learner.setCourse(request.getCourse());
        if (request.getSemester() != null) learner.setSemester(request.getSemester());
        if (request.getGpa() != null) learner.setGpa(request.getGpa());
        if (request.getSkills() != null) learner.setSkills(request.getSkills());
        if (request.getExperienceMonths() != null) learner.setExperienceMonths(request.getExperienceMonths());
        if (request.getResumeUrl() != null) learner.setResumeUrl(request.getResumeUrl());

        learnerRepository.save(learner);
        log.info("Profile updated for user: {}", email);

        return ResponseEntity.ok(learnerService.toPublicResponse(learner));
    }
}
