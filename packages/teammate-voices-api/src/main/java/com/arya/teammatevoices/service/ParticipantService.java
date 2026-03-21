package com.arya.teammatevoices.service;

import com.arya.teammatevoices.dto.ParticipantDTO;
import com.arya.teammatevoices.exception.ResourceNotFoundException;
import com.arya.teammatevoices.model.Participant;
import com.arya.teammatevoices.repository.ParticipantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParticipantService {

    private final ParticipantRepository participantRepository;

    @Transactional(readOnly = true)
    public List<ParticipantDTO> getAllParticipants() {
        return participantRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ParticipantDTO getParticipantById(String id) {
        Participant p = participantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Participant", id));
        return toDTO(p);
    }

    @Transactional
    public ParticipantDTO createParticipant(ParticipantDTO dto) {
        log.info("Creating participant: {}", dto.getEmail());
        Participant p = toEntity(dto);
        return toDTO(participantRepository.save(p));
    }

    @Transactional
    public void deleteParticipant(String id) {
        if (!participantRepository.existsById(id)) {
            throw new ResourceNotFoundException("Participant", id);
        }
        participantRepository.deleteById(id);
    }

    private ParticipantDTO toDTO(Participant p) {
        ParticipantDTO dto = new ParticipantDTO();
        dto.setParticipantId(p.getParticipantId());
        dto.setFullName(p.getFullName());
        dto.setEmail(p.getEmail());
        dto.setParticipantType(p.getParticipantType());
        dto.setTrainingProgram(p.getTrainingProgram());
        dto.setCohort(p.getCohort());
        dto.setStartDate(p.getStartDate());
        dto.setExpectedEndDate(p.getExpectedEndDate());
        dto.setIsActive(p.getIsActive());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setUpdatedAt(p.getUpdatedAt());
        return dto;
    }

    private Participant toEntity(ParticipantDTO dto) {
        Participant p = new Participant();
        p.setParticipantId(dto.getParticipantId());
        p.setFullName(dto.getFullName());
        p.setEmail(dto.getEmail());
        p.setParticipantType(dto.getParticipantType());
        p.setTrainingProgram(dto.getTrainingProgram());
        p.setCohort(dto.getCohort());
        p.setStartDate(dto.getStartDate());
        p.setExpectedEndDate(dto.getExpectedEndDate());
        p.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : true);
        return p;
    }
}
