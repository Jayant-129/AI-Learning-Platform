package com.learnerplatform.backend.controller;

import com.learnerplatform.backend.dto.LearnerRequest;
import com.learnerplatform.backend.dto.LearnerResponse;
import com.learnerplatform.backend.service.LearnerService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/learners")
public class LearnerController {

    private static final Logger log = LoggerFactory.getLogger(LearnerController.class);

    private final LearnerService learnerService;

    public LearnerController(LearnerService learnerService) {
        this.learnerService = learnerService;
    }

    @GetMapping
    public ResponseEntity<List<LearnerResponse>> getAll() {
        log.info("Fetching all learners");
        return ResponseEntity.ok(learnerService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearnerResponse> getById(@PathVariable Long id) {
        log.info("Fetching learner: {}", id);
        return ResponseEntity.ok(learnerService.findById(id));
    }

    @PostMapping
    public ResponseEntity<LearnerResponse> create(@Valid @RequestBody LearnerRequest request) {
        log.info("Creating learner: {}", request.getStudentId());
        return ResponseEntity.ok(learnerService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearnerResponse> update(@PathVariable Long id, @Valid @RequestBody LearnerRequest request) {
        log.info("Updating learner: {}", id);
        return ResponseEntity.ok(learnerService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        log.info("Deleting learner: {}", id);
        learnerService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/upload-csv")
    public ResponseEntity<List<LearnerResponse>> uploadCsv(@RequestParam("file") MultipartFile file) {
        log.info("CSV upload received: {}", file.getOriginalFilename());
        return ResponseEntity.ok(learnerService.uploadCsv(file));
    }
}
