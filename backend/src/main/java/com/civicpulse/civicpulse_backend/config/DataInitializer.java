package com.civicpulse.civicpulse_backend.config;

import com.civicpulse.civicpulse_backend.model.Department;
import com.civicpulse.civicpulse_backend.model.Role;
import com.civicpulse.civicpulse_backend.model.User;
import com.civicpulse.civicpulse_backend.repository.DepartmentRepository;
import com.civicpulse.civicpulse_backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initializeData(
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Initialize Departments if they don't exist
            if (departmentRepository.count() == 0) {
                Department[] departments = {
                    createDept("Water Supply Division", "Water Supply"),
                    createDept("Electrical Department", "Electricity"),
                    createDept("Roads & Infrastructure", "Roads"),
                    createDept("Sanitation Services", "Sanitation"),
                    createDept("Drainage Management", "Drainage"),
                    createDept("Parks & Recreation", "Parks"),
                    createDept("Noise Control Unit", "Noise"),
                };
                for (Department dept : departments) {
                    departmentRepository.save(dept);
                }
                System.out.println("✓ Initialized " + departments.length + " departments");
            }

            // Initialize Officers if none exist
            if (userRepository.findAll().stream()
                    .noneMatch(u -> u.getRole() == Role.OFFICER)) {
                User[] officers = {
                    createOfficer(1L, "ravi_kumar", "ravi.kumar@civic.gov", "Ravi Kumar", passwordEncoder),
                    createOfficer(2L, "priya_singh", "priya.singh@civic.gov", "Priya Singh", passwordEncoder),
                    createOfficer(3L, "amit_patel", "amit.patel@civic.gov", "Amit Patel", passwordEncoder),
                };
                for (User officer : officers) {
                    if (!userRepository.existsById(officer.getId())) {
                        userRepository.save(officer);
                    }
                }
                System.out.println("✓ Initialized " + officers.length + " officers");
            }
        };
    }

    private Department createDept(String name, String category) {
        Department dept = new Department();
        dept.setName(name);
        dept.setCategory(category);
        return dept;
    }

    private User createOfficer(Long id, String username, String email, String fullName, PasswordEncoder passwordEncoder) {
        User officer = new User();
        officer.setUsername(username);
        officer.setEmail(email);
        officer.setFullName(fullName);
        officer.setPassword(passwordEncoder.encode("password123"));
        officer.setRole(Role.OFFICER);
        return officer;
    }
}
