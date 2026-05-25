package com.learnerplatform.backend.config;

import com.learnerplatform.backend.model.*;
import com.learnerplatform.backend.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final LearnerRepository learnerRepository;
    private final PlacementDriveRepository driveRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    public DataSeeder(UserRepository userRepository, LearnerRepository learnerRepository,
                      PlacementDriveRepository driveRepository, PasswordEncoder passwordEncoder,
                      JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.learnerRepository = learnerRepository;
        this.driveRepository = driveRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        // Always ensure the role check constraint includes MENTOR
        try {
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
            jdbcTemplate.execute(
                "ALTER TABLE users ADD CONSTRAINT users_role_check " +
                "CHECK (role IN ('ADMIN','MENTOR','LEARNER'))"
            );
            log.info("Role constraint updated to include MENTOR");
        } catch (Exception e) {
            log.warn("Could not update role constraint: {}", e.getMessage());
        }

        if (userRepository.count() > 0) {
            log.info("Database already seeded, skipping...");
            return;
        }

        log.info("Seeding database with initial data...");

        // Create admin user
        User admin = User.builder()
                .name("Admin")
                .email("admin@learner.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ADMIN)
                .build();
        userRepository.save(admin);

        // Create sample learners
        String[][] learnerData = {
                {"STU001", "Rahul Sharma", "rahul@example.com", "Computer Science", "6", "8.5", "Java,Python,SQL,React", "6"},
                {"STU002", "Priya Patel", "priya@example.com", "Information Technology", "8", "9.1", "Python,Machine Learning,TensorFlow,Docker", "12"},
                {"STU003", "Amit Kumar", "amit@example.com", "Electronics", "4", "7.2", "C++,Embedded Systems,IoT", "0"},
                {"STU004", "Sneha Reddy", "sneha@example.com", "Computer Science", "8", "8.8", "JavaScript,React,Node.js,MongoDB,AWS", "18"},
                {"STU005", "Vikram Singh", "vikram@example.com", "Mechanical", "6", "6.9", "AutoCAD,MATLAB,Python", "3"},
                {"STU006", "Ananya Gupta", "ananya@example.com", "Computer Science", "8", "9.4", "Java,Spring Boot,Microservices,Kubernetes,AWS", "24"},
                {"STU007", "Rohan Das", "rohan@example.com", "Information Technology", "6", "7.8", "Python,Django,PostgreSQL", "6"},
                {"STU008", "Meera Nair", "meera@example.com", "Data Science", "4", "8.1", "Python,R,Tableau,SQL,Spark", "3"},
                {"STU009", "Karthik Iyer", "karthik@example.com", "Computer Science", "8", "7.5", "Java,Android,Kotlin,Firebase", "9"},
                {"STU010", "Divya Menon", "divya@example.com", "Electronics", "6", "8.3", "VLSI,Verilog,Python,MATLAB", "0"},
        };

        for (String[] d : learnerData) {
            Learner learner = Learner.builder()
                    .studentId(d[0])
                    .name(d[1])
                    .email(d[2])
                    .course(d[3])
                    .semester(Integer.parseInt(d[4]))
                    .gpa(Double.parseDouble(d[5]))
                    .skills(d[6])
                    .experienceMonths(Integer.parseInt(d[7]))
                    .status("ACTIVE")
                    .build();
            learnerRepository.save(learner);
        }

        // Create sample placement drives
        driveRepository.save(PlacementDrive.builder()
                .companyName("Google")
                .role("Software Engineer")
                .description("Full-time SDE role for fresh graduates")
                .eligibilityCriteria("CS/IT students with GPA >= 8.0")
                .minimumGpa(8.0)
                .driveDate(LocalDate.now().plusDays(30))
                .status("UPCOMING")
                .location("Bangalore")
                .packageOffered("25 LPA")
                .build());

        driveRepository.save(PlacementDrive.builder()
                .companyName("Microsoft")
                .role("Associate SDE")
                .description("Associate Software Development Engineer")
                .eligibilityCriteria("All branches with GPA >= 7.5")
                .minimumGpa(7.5)
                .driveDate(LocalDate.now().plusDays(45))
                .status("UPCOMING")
                .location("Hyderabad")
                .packageOffered("22 LPA")
                .build());

        driveRepository.save(PlacementDrive.builder()
                .companyName("Amazon")
                .role("SDE I")
                .description("Software Development Engineer I")
                .eligibilityCriteria("CS/IT/ECE with GPA >= 7.0")
                .minimumGpa(7.0)
                .driveDate(LocalDate.now().plusDays(15))
                .status("UPCOMING")
                .location("Chennai")
                .packageOffered("28 LPA")
                .build());

        driveRepository.save(PlacementDrive.builder()
                .companyName("TCS")
                .role("Systems Engineer")
                .description("Systems Engineer - Digital Track")
                .eligibilityCriteria("All branches with GPA >= 6.0")
                .minimumGpa(6.0)
                .driveDate(LocalDate.now().minusDays(10))
                .status("COMPLETED")
                .location("Mumbai")
                .packageOffered("7 LPA")
                .build());

        log.info("Database seeding complete! Created {} users, {} learners, {} drives",
                userRepository.count(), learnerRepository.count(), driveRepository.count());
    }
}
