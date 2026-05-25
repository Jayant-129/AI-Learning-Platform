package com.learnerplatform.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LearnerRequest {
    @NotBlank(message = "Student ID is required")
    private String studentId;

    @NotBlank(message = "Name is required")
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
}
