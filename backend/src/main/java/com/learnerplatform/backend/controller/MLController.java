package com.learnerplatform.backend.controller;

import com.learnerplatform.backend.dto.MLPredictionResponse;
import com.learnerplatform.backend.service.MLIntegrationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ml")
public class MLController {

    private static final Logger log = LoggerFactory.getLogger(MLController.class);

    private final MLIntegrationService mlService;

    public MLController(MLIntegrationService mlService) {
        this.mlService = mlService;
    }

    @PostMapping("/predict/{learnerId}")
    public ResponseEntity<MLPredictionResponse> predict(@PathVariable Long learnerId) {
        log.info("ML prediction requested for learner: {}", learnerId);
        return ResponseEntity.ok(mlService.predictPlacement(learnerId));
    }

    @GetMapping("/history/{learnerId}")
    public ResponseEntity<?> getHistory(@PathVariable Long learnerId) {
        return ResponseEntity.ok(mlService.getPredictionHistory(learnerId));
    }
}
