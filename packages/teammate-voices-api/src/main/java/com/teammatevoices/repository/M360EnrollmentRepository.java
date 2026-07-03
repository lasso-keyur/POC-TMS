package com.teammatevoices.repository;

import com.teammatevoices.model.M360Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface M360EnrollmentRepository extends JpaRepository<M360Enrollment, Long> {
    List<M360Enrollment> findByCycleIdOrderByEnrollmentIdAsc(Long cycleId);
    Optional<M360Enrollment> findByParticipantToken(String participantToken);
    Optional<M360Enrollment> findByManagerToken(String managerToken);
    long countByCycleId(Long cycleId);
    boolean existsByCycleIdAndParticipantId(Long cycleId, String participantId);
}
