package com.learnerplatform.backend.service;

import com.learnerplatform.backend.exception.ResourceNotFoundException;
import com.learnerplatform.backend.model.PlacementApplication;
import com.learnerplatform.backend.model.PlacementDrive;
import com.learnerplatform.backend.model.Learner;
import com.learnerplatform.backend.repository.LearnerRepository;
import com.learnerplatform.backend.repository.PlacementApplicationRepository;
import com.learnerplatform.backend.repository.PlacementDriveRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PlacementService {

    private static final Logger log = LoggerFactory.getLogger(PlacementService.class);

    private final PlacementDriveRepository driveRepository;
    private final PlacementApplicationRepository applicationRepository;
    private final LearnerRepository learnerRepository;

    public PlacementService(PlacementDriveRepository driveRepository,
                            PlacementApplicationRepository applicationRepository,
                            LearnerRepository learnerRepository) {
        this.driveRepository = driveRepository;
        this.applicationRepository = applicationRepository;
        this.learnerRepository = learnerRepository;
    }

    // ---- Drives ----

    public List<PlacementDrive> findAllDrives() {
        log.info("Fetching all placement drives");
        return driveRepository.findAll();
    }

    public PlacementDrive findDriveById(Long id) {
        return driveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Drive not found with id: " + id));
    }

    public PlacementDrive createDrive(PlacementDrive drive) {
        log.info("Creating placement drive: {} at {}", drive.getRole(), drive.getCompanyName());
        return driveRepository.save(drive);
    }

    public PlacementDrive updateDrive(Long id, PlacementDrive updated) {
        PlacementDrive drive = findDriveById(id);
        drive.setCompanyName(updated.getCompanyName());
        drive.setRole(updated.getRole());
        drive.setDescription(updated.getDescription());
        drive.setEligibilityCriteria(updated.getEligibilityCriteria());
        drive.setMinimumGpa(updated.getMinimumGpa());
        drive.setDriveDate(updated.getDriveDate());
        drive.setStatus(updated.getStatus());
        drive.setMaxApplications(updated.getMaxApplications());
        drive.setLocation(updated.getLocation());
        drive.setPackageOffered(updated.getPackageOffered());
        log.info("Updating placement drive: {}", id);
        return driveRepository.save(drive);
    }

    public void deleteDrive(Long id) {
        log.info("Deleting placement drive: {}", id);
        if (!driveRepository.existsById(id)) {
            throw new ResourceNotFoundException("Drive not found with id: " + id);
        }
        driveRepository.deleteById(id);
    }

    // ---- Applications ----

    public List<PlacementApplication> findAllApplications() {
        log.info("Fetching all placement applications");
        return applicationRepository.findAll();
    }

    public List<PlacementApplication> findApplicationsByDrive(Long driveId) {
        return applicationRepository.findByDriveId(driveId);
    }

    public List<PlacementApplication> findApplicationsByLearner(Long learnerId) {
        return applicationRepository.findByLearnerId(learnerId);
    }

    public PlacementApplication applyToDrive(Long learnerId, Long driveId) {
        log.info("Learner {} applying to drive {}", learnerId, driveId);

        Learner learner = learnerRepository.findById(learnerId)
                .orElseThrow(() -> new ResourceNotFoundException("Learner not found: " + learnerId));
        PlacementDrive drive = findDriveById(driveId);

        PlacementApplication application = PlacementApplication.builder()
                .learner(learner)
                .drive(drive)
                .status("APPLIED")
                .build();

        return applicationRepository.save(application);
    }

    public PlacementApplication updateApplicationStatus(Long applicationId, String status, String result) {
        PlacementApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));

        application.setStatus(status);
        if (result != null) {
            application.setResult(result);
        }
        log.info("Updated application {} status to {}", applicationId, status);
        return applicationRepository.save(application);
    }
}
