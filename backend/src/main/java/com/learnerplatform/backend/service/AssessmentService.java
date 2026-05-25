package com.learnerplatform.backend.service;

import com.learnerplatform.backend.exception.ResourceNotFoundException;
import com.learnerplatform.backend.model.Assessment;
import com.learnerplatform.backend.model.Learner;
import com.learnerplatform.backend.repository.AssessmentRepository;
import com.learnerplatform.backend.repository.LearnerRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AssessmentService {

    private static final Logger log = LoggerFactory.getLogger(AssessmentService.class);

    private final AssessmentRepository assessmentRepository;
    private final LearnerRepository learnerRepository;
    private final NotificationService notificationService;
    private final NotificationPushService notificationPushService;

    public AssessmentService(AssessmentRepository assessmentRepository,
                             LearnerRepository learnerRepository,
                             NotificationService notificationService,
                             NotificationPushService notificationPushService) {
        this.assessmentRepository = assessmentRepository;
        this.learnerRepository = learnerRepository;
        this.notificationService = notificationService;
        this.notificationPushService = notificationPushService;
    }

    public List<Map<String, Object>> findAll() {
        return assessmentRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> findByLearner(Long learnerId) {
        return assessmentRepository.findByLearnerIdOrderByAssessedAtDesc(learnerId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Map<String, Object> create(Map<String, Object> request) {
        Long learnerId = Long.valueOf(request.get("learnerId").toString());
        Learner learner = learnerRepository.findById(learnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Learner not found: " + learnerId));

        Assessment assessment = Assessment.builder()
                .learner(learner)
                .type(request.get("type").toString())
                .score(Double.valueOf(request.get("score").toString()))
                .maxScore(request.containsKey("maxScore") && request.get("maxScore") != null
                        ? Double.valueOf(request.get("maxScore").toString()) : 100.0)
                .feedback(request.containsKey("feedback") ? (String) request.get("feedback") : null)
                .assessedBy(request.containsKey("assessedBy") ? (String) request.get("assessedBy") : null)
                .build();

        Assessment saved = assessmentRepository.save(assessment);
        log.info("Assessment created for learner {} type {}", learnerId, saved.getType());

        // Send real-time notification to learner
        try {
            if (learner.getUser() != null) {
                String msg = String.format("New %s assessment recorded: %.0f/%.0f by %s",
                        saved.getType().replace("_", " "),
                        saved.getScore(),
                        saved.getMaxScore(),
                        saved.getAssessedBy() != null ? saved.getAssessedBy() : "Admin");
                notificationService.createNotification(learner.getUser().getId(), msg, "ASSESSMENT");
                notificationPushService.pushToUser(learner.getUser().getId(), msg, "ASSESSMENT");
            }
        } catch (Exception e) {
            log.warn("Failed to send assessment notification: {}", e.getMessage());
        }

        return toDto(saved);
    }

    public Map<String, Object> update(Long id, Map<String, Object> request) {
        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment not found: " + id));

        if (request.containsKey("score")) assessment.setScore(Double.valueOf(request.get("score").toString()));
        if (request.containsKey("maxScore")) assessment.setMaxScore(Double.valueOf(request.get("maxScore").toString()));
        if (request.containsKey("feedback")) assessment.setFeedback((String) request.get("feedback"));
        if (request.containsKey("assessedBy")) assessment.setAssessedBy((String) request.get("assessedBy"));

        Assessment saved = assessmentRepository.save(assessment);
        log.info("Assessment updated: {}", id);

        // Notify learner of score update
        try {
            Learner learner = saved.getLearner();
            if (learner != null && learner.getUser() != null) {
                String msg = String.format("Your %s assessment score was updated to %.0f/%.0f",
                        saved.getType().replace("_", " "),
                        saved.getScore(),
                        saved.getMaxScore());
                notificationService.createNotification(learner.getUser().getId(), msg, "SCORE_UPDATED");
                notificationPushService.pushToUser(learner.getUser().getId(), msg, "SCORE_UPDATED");
            }
        } catch (Exception e) {
            log.warn("Failed to send score update notification: {}", e.getMessage());
        }

        return toDto(saved);
    }

    public void delete(Long id) {
        if (!assessmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Assessment not found: " + id);
        }
        assessmentRepository.deleteById(id);
        log.info("Assessment deleted: {}", id);
    }

    private Map<String, Object> toDto(Assessment a) {
        Map<String, Object> dto = new java.util.LinkedHashMap<>();
        dto.put("id", a.getId());
        dto.put("type", a.getType());
        dto.put("score", a.getScore());
        dto.put("maxScore", a.getMaxScore());
        dto.put("feedback", a.getFeedback());
        dto.put("assessedBy", a.getAssessedBy());
        dto.put("assessedAt", a.getAssessedAt());
        // Flat learner info (no nested proxy)
        if (a.getLearner() != null) {
            Map<String, Object> learnerDto = new java.util.LinkedHashMap<>();
            learnerDto.put("id", a.getLearner().getId());
            learnerDto.put("name", a.getLearner().getName());
            learnerDto.put("studentId", a.getLearner().getStudentId());
            dto.put("learner", learnerDto);
            dto.put("learnerName", a.getLearner().getName());
        }
        return dto;
    }
}
