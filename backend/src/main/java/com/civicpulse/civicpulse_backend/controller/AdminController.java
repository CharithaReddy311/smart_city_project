package com.civicpulse.civicpulse_backend.controller;

import com.civicpulse.civicpulse_backend.model.*;
import com.civicpulse.civicpulse_backend.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PutMapping("/grievance/{id}/assign")
    public ResponseEntity<Grievance> assign(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(adminService.assignOfficer(id, body));
    }

    @GetMapping("/officers")
    public ResponseEntity<List<User>> officers() {
        return ResponseEntity.ok(adminService.getAllOfficers());
    }

    @GetMapping("/departments")
    public ResponseEntity<List<Department>> departments() {
        return ResponseEntity.ok(adminService.getAllDepartments());
    }

    @GetMapping({"/users", "/user/all"})
    public ResponseEntity<List<User>> users() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @DeleteMapping({"/users/{id}", "/user/{id}"})
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            adminService.deleteUser(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (RuntimeException e) {
            if ("User not found".equals(e.getMessage())) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}