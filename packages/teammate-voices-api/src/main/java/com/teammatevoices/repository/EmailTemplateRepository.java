package com.teammatevoices.repository;

import com.teammatevoices.model.EmailTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, Long> {
    List<EmailTemplate> findByCategory(String category);
    List<EmailTemplate> findByStatus(String status);
    List<EmailTemplate> findByCategoryAndStatus(String category, String status);
}
