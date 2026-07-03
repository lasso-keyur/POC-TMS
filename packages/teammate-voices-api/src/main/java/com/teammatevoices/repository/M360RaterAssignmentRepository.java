package com.teammatevoices.repository;

import com.teammatevoices.model.M360RaterAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface M360RaterAssignmentRepository extends JpaRepository<M360RaterAssignment, Long> {
    List<M360RaterAssignment> findByEnrollmentIdOrderByRaterAssignmentIdAsc(Long enrollmentId);
    Optional<M360RaterAssignment> findByFeedbackToken(String feedbackToken);
    List<M360RaterAssignment> findByRaterEmailOrderByRaterAssignmentIdAsc(String raterEmail);
    boolean existsByEnrollmentIdAndRaterEmail(Long enrollmentId, String raterEmail);
}
