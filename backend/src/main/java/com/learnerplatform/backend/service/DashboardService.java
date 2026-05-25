package com.learnerplatform.backend.service;

import com.learnerplatform.backend.dto.DashboardStats;
import com.learnerplatform.backend.repository.LearnerRepository;
import com.learnerplatform.backend.repository.PlacementApplicationRepository;
import com.learnerplatform.backend.repository.PlacementDriveRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    private static final Logger log = LoggerFactory.getLogger(DashboardService.class);

    private final LearnerRepository learnerRepository;
    private final PlacementDriveRepository driveRepository;
    private final PlacementApplicationRepository applicationRepository;

    public DashboardService(LearnerRepository learnerRepository,
                            PlacementDriveRepository driveRepository,
                            PlacementApplicationRepository applicationRepository) {
        this.learnerRepository = learnerRepository;
        this.driveRepository = driveRepository;
        this.applicationRepository = applicationRepository;
    }

    public DashboardStats getStats() {
        log.info("Generating dashboard stats");

        Map<String, Long> courseDistribution = new LinkedHashMap<>();
        learnerRepository.countByCourse().forEach(row -> {
                if (row[0] != null) courseDistribution.put((String) row[0], (Long) row[1]);
        });

        Map<String, Long> placementTrend = new LinkedHashMap<>();
        applicationRepository.countByMonth().forEach(row -> {
                if (row[0] != null) placementTrend.put((String) row[0], (Long) row[1]);
        });

        Double avgGpa = learnerRepository.findAverageGpa();

        return DashboardStats.builder()
                .totalLearners(learnerRepository.count())
                .activeLearners(learnerRepository.countByStatus("ACTIVE"))
                .totalDrives(driveRepository.count())
                .upcomingDrives(driveRepository.countByStatus("UPCOMING"))
                .totalApplications(applicationRepository.count())
                .placedCount(applicationRepository.countByResult("PLACED"))
                .averageGpa(avgGpa != null ? avgGpa : 0.0)
                .courseDistribution(courseDistribution)
                .placementTrend(placementTrend)
                .build();
    }
}
