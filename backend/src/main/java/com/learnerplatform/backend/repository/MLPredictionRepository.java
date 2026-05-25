package com.learnerplatform.backend.repository;

import com.learnerplatform.backend.model.MLPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MLPredictionRepository extends JpaRepository<MLPrediction, Long> {
    List<MLPrediction> findByLearnerIdOrderByPredictedAtDesc(Long learnerId);
    Optional<MLPrediction> findTopByLearnerIdOrderByPredictedAtDesc(Long learnerId);
}
