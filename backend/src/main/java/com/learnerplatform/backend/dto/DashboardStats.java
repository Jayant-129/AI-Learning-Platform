package com.learnerplatform.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private long totalLearners;
    private long activeLearners;
    private long totalDrives;
    private long upcomingDrives;
    private long totalApplications;
    private long placedCount;
    private double averageGpa;
    private Map<String, Long> courseDistribution;
    private Map<String, Long> placementTrend;
}
