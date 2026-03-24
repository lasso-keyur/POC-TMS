package com.teammatevoices.repository;

import com.teammatevoices.model.Participant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipantRepository extends JpaRepository<Participant, String> {
    Optional<Participant> findByEmail(String email);
    List<Participant> findByParticipantType(String participantType);
    List<Participant> findByIsActive(Boolean isActive);
    List<Participant> findByProgramId(Long programId);
}
