package com.arya.teammatevoices.repository;

import com.arya.teammatevoices.model.Survey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyRepository extends JpaRepository<Survey, Long> {
    List<Survey> findByStatus(String status);
    List<Survey> findByTemplateType(String templateType);
    List<Survey> findByParticipantType(String participantType);
}
