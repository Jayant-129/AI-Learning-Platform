package com.learnerplatform.backend.controller;

import com.learnerplatform.backend.model.PlacementApplication;
import com.learnerplatform.backend.model.PlacementDrive;
import com.learnerplatform.backend.service.PlacementService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/placements")
public class PlacementController {

    private static final Logger log = LoggerFactory.getLogger(PlacementController.class);

    private final PlacementService placementService;

    public PlacementController(PlacementService placementService) {
        this.placementService = placementService;
    }

    // ---- Drives ----

    @GetMapping("/drives")
    public ResponseEntity<List<PlacementDrive>> getAllDrives() {
        log.info("Fetching all placement drives");
        return ResponseEntity.ok(placementService.findAllDrives());
    }

    @GetMapping("/drives/{id}")
    public ResponseEntity<PlacementDrive> getDrive(@PathVariable Long id) {
        return ResponseEntity.ok(placementService.findDriveById(id));
    }

    @PostMapping("/drives")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlacementDrive> createDrive(@Valid @RequestBody PlacementDrive drive) {
        log.info("Creating placement drive: {}", drive.getCompanyName());
        return ResponseEntity.ok(placementService.createDrive(drive));
    }

    @PutMapping("/drives/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlacementDrive> updateDrive(@PathVariable Long id, @Valid @RequestBody PlacementDrive drive) {
        return ResponseEntity.ok(placementService.updateDrive(id, drive));
    }

    @DeleteMapping("/drives/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDrive(@PathVariable Long id) {
        placementService.deleteDrive(id);
        return ResponseEntity.noContent().build();
    }

    // ---- Applications ----

    @GetMapping("/applications")
    public ResponseEntity<List<PlacementApplication>> getAllApplications() {
        return ResponseEntity.ok(placementService.findAllApplications());
    }

    @GetMapping("/applications/drive/{driveId}")
    public ResponseEntity<List<PlacementApplication>> getByDrive(@PathVariable Long driveId) {
        return ResponseEntity.ok(placementService.findApplicationsByDrive(driveId));
    }

    @GetMapping("/applications/learner/{learnerId}")
    public ResponseEntity<List<PlacementApplication>> getByLearner(@PathVariable Long learnerId) {
        return ResponseEntity.ok(placementService.findApplicationsByLearner(learnerId));
    }

    @PostMapping("/applications")
    public ResponseEntity<PlacementApplication> apply(@RequestBody Map<String, Long> request) {
        log.info("Application: learner {} to drive {}", request.get("learnerId"), request.get("driveId"));
        return ResponseEntity.ok(
                placementService.applyToDrive(request.get("learnerId"), request.get("driveId"))
        );
    }

    @PutMapping("/applications/{id}/status")
    public ResponseEntity<PlacementApplication> updateStatus(
            @PathVariable Long id, @RequestBody Map<String, String> request) {
        return ResponseEntity.ok(
                placementService.updateApplicationStatus(id, request.get("status"), request.get("result"))
        );
    }
}
