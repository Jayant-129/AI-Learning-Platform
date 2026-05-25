package com.learnerplatform.backend.repository;

import com.learnerplatform.backend.model.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    List<Assessment> findByLearnerIdOrderByAssessedAtDesc(Long learnerId);
    List<Assessment> findByTypeOrderByAssessedAtDesc(String type);
}
