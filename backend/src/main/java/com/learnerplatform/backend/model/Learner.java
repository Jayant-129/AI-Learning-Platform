package com.learnerplatform.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "learners")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Learner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id")
    private User mentor;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String studentId;

    @NotBlank
    @Column(nullable = false)
    private String name;

    private String email;

    private String course;

    private Integer semester;

    private Double gpa;

    @Column(columnDefinition = "TEXT")
    private String skills;

    private Integer experienceMonths;

    private String resumeUrl;

    @Column(nullable = false)
    @Builder.Default
    private String status = "ACTIVE";

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
