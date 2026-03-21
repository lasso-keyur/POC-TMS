package com.arya.teammatevoices.controller;

import com.arya.teammatevoices.dto.SurveyDTO;
import com.arya.teammatevoices.service.SurveyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/surveys")
@RequiredArgsConstructor
@Slf4j
public class SurveyController {

    private final SurveyService surveyService;

    @GetMapping
    public ResponseEntity<List<SurveyDTO>> getAllSurveys() {
        log.info("GET /surveys");
        return ResponseEntity.ok(surveyService.getAllSurveys());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SurveyDTO> getSurveyById(@PathVariable Long id) {
        log.info("GET /surveys/{}", id);
        return ResponseEntity.ok(surveyService.getSurveyById(id));
    }

    @PostMapping
    public ResponseEntity<SurveyDTO> createSurvey(@RequestBody SurveyDTO surveyDTO) {
        log.info("POST /surveys - {}", surveyDTO.getTitle());
        SurveyDTO created = surveyService.createSurvey(surveyDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SurveyDTO> updateSurvey(@PathVariable Long id, @RequestBody SurveyDTO surveyDTO) {
        log.info("PUT /surveys/{}", id);
        return ResponseEntity.ok(surveyService.updateSurvey(id, surveyDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSurvey(@PathVariable Long id) {
        log.info("DELETE /surveys/{}", id);
        surveyService.deleteSurvey(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<SurveyDTO> publishSurvey(@PathVariable Long id) {
        log.info("POST /surveys/{}/publish", id);
        return ResponseEntity.ok(surveyService.publishSurvey(id));
    }
}
