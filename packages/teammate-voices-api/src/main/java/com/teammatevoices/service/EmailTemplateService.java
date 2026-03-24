package com.teammatevoices.service;

import com.teammatevoices.dto.EmailTemplateDTO;
import com.teammatevoices.exception.ResourceNotFoundException;
import com.teammatevoices.model.EmailTemplate;
import com.teammatevoices.repository.EmailTemplateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmailTemplateService {

    private static final Logger log = LoggerFactory.getLogger(EmailTemplateService.class);

    private final EmailTemplateRepository templateRepository;

    public EmailTemplateService(EmailTemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    @Transactional(readOnly = true)
    public List<EmailTemplateDTO> getAllTemplates() {
        return templateRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmailTemplateDTO> getTemplatesByCategory(String category) {
        return templateRepository.findByCategory(category).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmailTemplateDTO getTemplateById(Long id) {
        EmailTemplate t = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmailTemplate", id));
        return toDTO(t);
    }

    @Transactional
    public EmailTemplateDTO createTemplate(EmailTemplateDTO dto) {
        log.info("Creating email template: {}", dto.getName());
        EmailTemplate t = toEntity(dto);
        return toDTO(templateRepository.save(t));
    }

    @Transactional
    public EmailTemplateDTO updateTemplate(Long id, EmailTemplateDTO dto) {
        log.info("Updating email template: {}", id);
        EmailTemplate t = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmailTemplate", id));

        t.setName(dto.getName());
        t.setDescription(dto.getDescription());
        t.setCategory(dto.getCategory());
        t.setSubject(dto.getSubject());
        t.setFromName(dto.getFromName());
        t.setBodyHtml(dto.getBodyHtml());
        t.setBodyJson(dto.getBodyJson());
        t.setMergeFields(dto.getMergeFields());
        if (dto.getStatus() != null) t.setStatus(dto.getStatus());

        return toDTO(templateRepository.save(t));
    }

    @Transactional
    public void deleteTemplate(Long id) {
        log.info("Deleting email template: {}", id);
        if (!templateRepository.existsById(id)) {
            throw new ResourceNotFoundException("EmailTemplate", id);
        }
        templateRepository.deleteById(id);
    }

    @Transactional
    public EmailTemplateDTO duplicateTemplate(Long id) {
        log.info("Duplicating email template: {}", id);
        EmailTemplate source = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmailTemplate", id));

        EmailTemplate clone = new EmailTemplate();
        clone.setName(source.getName() + " (Copy)");
        clone.setDescription(source.getDescription());
        clone.setCategory(source.getCategory());
        clone.setSubject(source.getSubject());
        clone.setFromName(source.getFromName());
        clone.setBodyHtml(source.getBodyHtml());
        clone.setBodyJson(source.getBodyJson());
        clone.setMergeFields(source.getMergeFields());
        clone.setStatus("DRAFT");
        clone.setIsDefault(false);

        return toDTO(templateRepository.save(clone));
    }

    private EmailTemplateDTO toDTO(EmailTemplate t) {
        EmailTemplateDTO dto = new EmailTemplateDTO();
        dto.setTemplateId(t.getTemplateId());
        dto.setName(t.getName());
        dto.setDescription(t.getDescription());
        dto.setCategory(t.getCategory());
        dto.setSubject(t.getSubject());
        dto.setFromName(t.getFromName());
        dto.setBodyHtml(t.getBodyHtml());
        dto.setBodyJson(t.getBodyJson());
        dto.setMergeFields(t.getMergeFields());
        dto.setStatus(t.getStatus());
        dto.setIsDefault(t.getIsDefault());
        dto.setCreatedBy(t.getCreatedBy());
        dto.setCreatedAt(t.getCreatedAt());
        dto.setUpdatedAt(t.getUpdatedAt());
        return dto;
    }

    private EmailTemplate toEntity(EmailTemplateDTO dto) {
        EmailTemplate t = new EmailTemplate();
        t.setName(dto.getName());
        t.setDescription(dto.getDescription());
        t.setCategory(dto.getCategory() != null ? dto.getCategory() : "CUSTOM");
        t.setSubject(dto.getSubject());
        t.setFromName(dto.getFromName());
        t.setBodyHtml(dto.getBodyHtml() != null ? dto.getBodyHtml() : "");
        t.setBodyJson(dto.getBodyJson());
        t.setMergeFields(dto.getMergeFields());
        t.setStatus(dto.getStatus() != null ? dto.getStatus() : "DRAFT");
        t.setIsDefault(dto.getIsDefault() != null ? dto.getIsDefault() : false);
        return t;
    }
}
