package com.teammatevoices.repository;

import com.teammatevoices.model.Dispatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DispatchRepository extends JpaRepository<Dispatch, Long> {
    List<Dispatch> findByParticipantId(String participantId);
    List<Dispatch> findByDispatchStatus(String dispatchStatus);
    List<Dispatch> findBySurveyId(Long surveyId);
    Optional<Dispatch> findByDispatchToken(String dispatchToken);
}
