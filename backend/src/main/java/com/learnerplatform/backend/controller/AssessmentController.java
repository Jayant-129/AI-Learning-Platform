package com.learnerplatform.backend.controller;

import com.learnerplatform.backend.service.AssessmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    private static final Logger log = LoggerFactory.getLogger(AssessmentController.class);

    private final AssessmentService assessmentService;

    public AssessmentController(AssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAll() {
        log.info("Fetching all assessments");
        return ResponseEntity.ok(assessmentService.findAll());
    }

    @GetMapping("/learner/{learnerId}")
    public ResponseEntity<List<Map<String, Object>>> getByLearner(@PathVariable Long learnerId) {
        log.info("Fetching assessments for learner: {}", learnerId);
        return ResponseEntity.ok(assessmentService.findByLearner(learnerId));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody Map<String, Object> request) {
        log.info("Creating assessment for learner: {}", request.get("learnerId"));
        return ResponseEntity.ok(assessmentService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        log.info("Updating assessment: {}", id);
        return ResponseEntity.ok(assessmentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("Deleting assessment: {}", id);
        assessmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
