package com.arya.teammatevoices.repository;

import com.arya.teammatevoices.model.Dispatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DispatchRepository extends JpaRepository<Dispatch, Long> {
    List<Dispatch> findByParticipantId(String participantId);
    List<Dispatch> findByDispatchStatus(String dispatchStatus);
    List<Dispatch> findBySurveyId(Long surveyId);
}
