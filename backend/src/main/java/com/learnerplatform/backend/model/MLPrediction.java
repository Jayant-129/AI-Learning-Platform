package com.learnerplatform.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "ml_predictions")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class MLPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "learner_id", nullable = false)
    private Learner learner;

    @Column(nullable = false)
    private Double placementProbability;

    @Column(nullable = false)
    @Builder.Default
    private Boolean placeable = false;

    @Column(columnDefinition = "TEXT")
    private String topFactors;

    @Column(columnDefinition = "TEXT")
    private String featuresUsed;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime predictedAt;
}
