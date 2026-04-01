package com.civicpulse.civicpulse_backend.service;

import com.civicpulse.civicpulse_backend.model.*;
import com.civicpulse.civicpulse_backend.repository.*;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class OfficerService {

    private final GrievanceRepository grievanceRepo;
    private final UserRepository userRepo;

    public OfficerService(GrievanceRepository grievanceRepo,
                          UserRepository userRepo) {
        this.grievanceRepo = grievanceRepo;
        this.userRepo = userRepo;
    }

    public List<Grievance> getAssigned(String email) {
        User officer = resolveOfficer(email);
        return grievanceRepo.findByAssignedOfficerId(officer.getId());
    }

        public Map<String, Object> getDashboardStats(String email) {
        List<Grievance> assigned = getAssigned(email);
        long total = assigned.size();
        long pending = assigned.stream()
            .filter(g -> g.getStatus() == GrievanceStatus.PENDING)
            .count();
        long inProgress = assigned.stream()
            .filter(g -> g.getStatus() == GrievanceStatus.IN_PROGRESS)
            .count();
        long resolved = assigned.stream()
            .filter(g -> g.getStatus() == GrievanceStatus.RESOLVED)
            .count();

        LocalDateTime now = LocalDateTime.now();
        long overdue = assigned.stream()
            .filter(g -> g.getStatus() != GrievanceStatus.RESOLVED)
            .filter(g -> g.getDeadline() != null && g.getDeadline().isBefore(now))
            .count();

        long resolvedWithDeadline = assigned.stream()
            .filter(g -> g.getStatus() == GrievanceStatus.RESOLVED)
            .filter(g -> g.getDeadline() != null)
            .count();
        long resolvedOnTime = assigned.stream()
            .filter(g -> g.getStatus() == GrievanceStatus.RESOLVED)
            .filter(g -> g.getDeadline() != null && g.getResolvedDate() != null)
            .filter(g -> !g.getResolvedDate().isAfter(g.getDeadline()))
            .count();
        int slaScore = resolvedWithDeadline == 0
            ? 100
            : (int) Math.round((resolvedOnTime * 100.0) / resolvedWithDeadline);

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalAssigned", total);
        stats.put("pending", pending);
        stats.put("inProgress", inProgress);
        stats.put("resolved", resolved);
        stats.put("overdue", overdue);
        stats.put("resolvedOnTime", resolvedOnTime);
        stats.put("resolvedWithDeadline", resolvedWithDeadline);
        stats.put("slaScore", slaScore);
        return stats;
        }

    private User resolveOfficer(String principal) {
        return userRepo.findByEmail(principal)
            .or(() -> userRepo.findByUsername(principal))
            .or(() -> userRepo.findByEmailIgnoreCase(principal))
            .or(() -> userRepo.findByUsernameIgnoreCase(principal))
                .orElseThrow(() -> new RuntimeException("Officer not found"));
    }

    public Grievance resolve(Long id, Map<String, String> body) {
        Grievance g = grievanceRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        g.setStatus(GrievanceStatus.valueOf(body.get("status")));
        g.setResolutionNote(body.get("note"));
        if (body.get("status").equals("RESOLVED")) {
            g.setResolvedDate(java.time.LocalDateTime.now());
        }
        return grievanceRepo.save(g);
    }
}