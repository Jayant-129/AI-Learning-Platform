package com.learnerplatform.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "assessments")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "learner_id", nullable = false)
    private Learner learner;

    @Column(nullable = false)
    private String type; // APTITUDE, CODING, COMMUNICATION, ATTENDANCE, MOCK_INTERVIEW

    @Column(nullable = false)
    private Double score;

    @Builder.Default
    private Double maxScore = 100.0;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    private String assessedBy;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime assessedAt;
}
