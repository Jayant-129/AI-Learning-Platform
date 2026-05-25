package com.learnerplatform.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "placement_drives")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PlacementDrive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String companyName;

    @NotBlank
    @Column(nullable = false)
    private String role;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String eligibilityCriteria;

    private Double minimumGpa;

    private LocalDate driveDate;

    @Column(nullable = false)
    @Builder.Default
    private String status = "UPCOMING";

    private Integer maxApplications;

    private String location;

    private String packageOffered;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
