package com.learnerplatform.backend.repository;

import com.learnerplatform.backend.model.PlacementApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlacementApplicationRepository extends JpaRepository<PlacementApplication, Long> {
    List<PlacementApplication> findByLearnerId(Long learnerId);
    List<PlacementApplication> findByDriveId(Long driveId);
    long countByStatus(String status);
    long countByResult(String result);

    @Query("SELECT FUNCTION('TO_CHAR', pa.appliedAt, 'YYYY-MM') AS month, COUNT(pa) FROM PlacementApplication pa GROUP BY FUNCTION('TO_CHAR', pa.appliedAt, 'YYYY-MM') ORDER BY month")
    List<Object[]> countByMonth();
}
