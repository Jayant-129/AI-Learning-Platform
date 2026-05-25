package com.learnerplatform.backend.repository;

import com.learnerplatform.backend.model.Learner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearnerRepository extends JpaRepository<Learner, Long> {
    Optional<Learner> findByStudentId(String studentId);
    Optional<Learner> findByUserId(Long userId);
    boolean existsByStudentId(String studentId);
    List<Learner> findByStatus(String status);
    List<Learner> findByCourseIgnoreCase(String course);

    @Query("SELECT l.course, COUNT(l) FROM Learner l GROUP BY l.course")
    List<Object[]> countByCourse();

    @Query("SELECT AVG(l.gpa) FROM Learner l WHERE l.gpa IS NOT NULL")
    Double findAverageGpa();

    long countByStatus(String status);
}
