package com.arya.teammatevoices.service;

import com.arya.teammatevoices.dto.DispatchDTO;
import com.arya.teammatevoices.exception.ResourceNotFoundException;
import com.arya.teammatevoices.model.Dispatch;
import com.arya.teammatevoices.repository.DispatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DispatchService {

    private final DispatchRepository dispatchRepository;

    @Transactional(readOnly = true)
    public List<DispatchDTO> getAllDispatches() {
        return dispatchRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DispatchDTO getDispatchById(Long id) {
        Dispatch d = dispatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Dispatch", id));
        return toDTO(d);
    }

    @Transactional(readOnly = true)
    public List<DispatchDTO> getDispatchesByParticipant(String participantId) {
        return dispatchRepository.findByParticipantId(participantId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private DispatchDTO toDTO(Dispatch d) {
        DispatchDTO dto = new DispatchDTO();
        dto.setDispatchId(d.getDispatchId());
        dto.setParticipantId(d.getParticipantId());
        dto.setSurveyId(d.getSurveyId());
        dto.setSurveyStage(d.getSurveyStage());
        dto.setDispatchStatus(d.getDispatchStatus());
        dto.setSentAt(d.getSentAt());
        dto.setOpenedAt(d.getOpenedAt());
        dto.setSubmittedAt(d.getSubmittedAt());
        dto.setReminderCount(d.getReminderCount());
        dto.setDispatchToken(d.getDispatchToken());
        dto.setCreatedAt(d.getCreatedAt());
        dto.setUpdatedAt(d.getUpdatedAt());
        return dto;
    }
}
