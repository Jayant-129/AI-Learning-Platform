package com.learnerplatform.backend.service;

import com.learnerplatform.backend.dto.LearnerRequest;
import com.learnerplatform.backend.dto.LearnerResponse;
import com.learnerplatform.backend.exception.BadRequestException;
import com.learnerplatform.backend.exception.ResourceNotFoundException;
import com.learnerplatform.backend.model.Learner;
import com.learnerplatform.backend.repository.LearnerRepository;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LearnerService {

    private static final Logger log = LoggerFactory.getLogger(LearnerService.class);

    private final LearnerRepository learnerRepository;
    private final com.learnerplatform.backend.repository.UserRepository userRepository;

    public LearnerService(LearnerRepository learnerRepository, com.learnerplatform.backend.repository.UserRepository userRepository) {
        this.learnerRepository = learnerRepository;
        this.userRepository = userRepository;
    }

    public List<LearnerResponse> findAll() {
        log.info("Fetching all learners");
        return learnerRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public LearnerResponse findById(Long id) {
        log.info("Fetching learner with id: {}", id);
        Learner learner = learnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Learner not found with id: " + id));
        return toResponse(learner);
    }

    public LearnerResponse create(LearnerRequest request) {
        log.info("Creating learner with studentId: {}", request.getStudentId());

        if (learnerRepository.existsByStudentId(request.getStudentId())) {
            throw new BadRequestException("Student ID already exists: " + request.getStudentId());
        }

        Learner learner = Learner.builder()
                .studentId(request.getStudentId())
                .name(request.getName())
                .email(request.getEmail())
                .course(request.getCourse())
                .semester(request.getSemester())
                .gpa(request.getGpa())
                .skills(request.getSkills())
                .experienceMonths(request.getExperienceMonths())
                .resumeUrl(request.getResumeUrl())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .build();

        if (request.getMentorId() != null) {
            com.learnerplatform.backend.model.User mentor = userRepository.findById(request.getMentorId())
                    .orElseThrow(() -> new BadRequestException("Mentor not found with id: " + request.getMentorId()));
            if (mentor.getRole() != com.learnerplatform.backend.model.Role.MENTOR) {
                throw new BadRequestException("User is not a mentor: " + request.getMentorId());
            }
            learner.setMentor(mentor);
        }

        learnerRepository.save(learner);
        log.info("Learner created successfully: {}", learner.getId());
        return toResponse(learner);
    }

    public LearnerResponse update(Long id, LearnerRequest request) {
        log.info("Updating learner with id: {}", id);

        Learner learner = learnerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Learner not found with id: " + id));

        learner.setName(request.getName());
        learner.setEmail(request.getEmail());
        learner.setCourse(request.getCourse());
        learner.setSemester(request.getSemester());
        learner.setGpa(request.getGpa());
        learner.setSkills(request.getSkills());
        learner.setExperienceMonths(request.getExperienceMonths());
        learner.setResumeUrl(request.getResumeUrl());
        if (request.getStatus() != null) {
            learner.setStatus(request.getStatus());
        }

        if (request.getMentorId() != null) {
            com.learnerplatform.backend.model.User mentor = userRepository.findById(request.getMentorId())
                    .orElseThrow(() -> new BadRequestException("Mentor not found with id: " + request.getMentorId()));
            if (mentor.getRole() != com.learnerplatform.backend.model.Role.MENTOR) {
                throw new BadRequestException("User is not a mentor: " + request.getMentorId());
            }
            learner.setMentor(mentor);
        } else {
            learner.setMentor(null);
        }

        learnerRepository.save(learner);
        log.info("Learner updated successfully: {}", learner.getId());
        return toResponse(learner);
    }

    public void delete(Long id) {
        log.info("Deleting learner with id: {}", id);
        if (!learnerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Learner not found with id: " + id);
        }
        learnerRepository.deleteById(id);
        log.info("Learner deleted: {}", id);
    }

    public List<LearnerResponse> uploadCsv(MultipartFile file) {
        log.info("Uploading CSV file: {}", file.getOriginalFilename());
        List<LearnerResponse> results = new ArrayList<>();

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream()))) {
            List<String[]> rows = reader.readAll();

            if (rows.isEmpty()) {
                throw new BadRequestException("CSV file is empty");
            }

            // Skip header row
            for (int i = 1; i < rows.size(); i++) {
                String[] row = rows.get(i);
                if (row.length < 2) continue;

                try {
                    Learner learner = Learner.builder()
                            .studentId(row[0].trim())
                            .name(row[1].trim())
                            .email(row.length > 2 ? row[2].trim() : null)
                            .course(row.length > 3 ? row[3].trim() : null)
                            .semester(row.length > 4 && !row[4].trim().isEmpty() ? Integer.parseInt(row[4].trim()) : null)
                            .gpa(row.length > 5 && !row[5].trim().isEmpty() ? Double.parseDouble(row[5].trim()) : null)
                            .skills(row.length > 6 ? row[6].trim() : null)
                            .experienceMonths(row.length > 7 && !row[7].trim().isEmpty() ? Integer.parseInt(row[7].trim()) : null)
                            .build();

                    if (!learnerRepository.existsByStudentId(learner.getStudentId())) {
                        learnerRepository.save(learner);
                        results.add(toResponse(learner));
                    }
                } catch (NumberFormatException e) {
                    log.warn("Skipping invalid row {}: {}", i, e.getMessage());
                }
            }

            log.info("CSV upload complete. {} learners imported.", results.size());
        } catch (CsvException | java.io.IOException e) {
            log.error("Error reading CSV file", e);
            throw new BadRequestException("Error reading CSV file: " + e.getMessage());
        }

        return results;
    }

    public LearnerResponse toPublicResponse(Learner learner) {
        return toResponse(learner);
    }

    private LearnerResponse toResponse(Learner learner) {
        return LearnerResponse.builder()
                .id(learner.getId())
                .studentId(learner.getStudentId())
                .name(learner.getName())
                .email(learner.getEmail())
                .course(learner.getCourse())
                .semester(learner.getSemester())
                .gpa(learner.getGpa())
                .skills(learner.getSkills())
                .experienceMonths(learner.getExperienceMonths())
                .resumeUrl(learner.getResumeUrl())
                .status(learner.getStatus())
                .mentorId(learner.getMentor() != null ? learner.getMentor().getId() : null)
                .mentorName(learner.getMentor() != null ? learner.getMentor().getName() : null)
                .createdAt(learner.getCreatedAt())
                .build();
    }
}

