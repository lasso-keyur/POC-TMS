package com.teammatevoices.controller;

import com.teammatevoices.dto.DispatchDTO;
import com.teammatevoices.service.DispatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dispatches")
@RequiredArgsConstructor
@Slf4j
public class DispatchController {

    private final DispatchService dispatchService;

    @GetMapping
    public ResponseEntity<List<DispatchDTO>> getAllDispatches() {
        log.info("GET /dispatches");
        return ResponseEntity.ok(dispatchService.getAllDispatches());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DispatchDTO> getDispatchById(@PathVariable Long id) {
        log.info("GET /dispatches/{}", id);
        return ResponseEntity.ok(dispatchService.getDispatchById(id));
    }

    @GetMapping("/participant/{participantId}")
    public ResponseEntity<List<DispatchDTO>> getByParticipant(@PathVariable String participantId) {
        log.info("GET /dispatches/participant/{}", participantId);
        return ResponseEntity.ok(dispatchService.getDispatchesByParticipant(participantId));
    }
}
