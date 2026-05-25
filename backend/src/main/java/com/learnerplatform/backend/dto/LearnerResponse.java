package com.learnerplatform.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearnerResponse {
    private Long id;
    private String studentId;
    private String name;
    private String email;
    private String course;
    private Integer semester;
    private Double gpa;
    private String skills;
    private Integer experienceMonths;
    private String resumeUrl;
    private String status;
    private Long mentorId;
    private String mentorName;
    private LocalDateTime createdAt;
}
