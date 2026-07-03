package com.teammatevoices.repository;

import com.teammatevoices.model.M360Cycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface M360CycleRepository extends JpaRepository<M360Cycle, Long> {
    List<M360Cycle> findByProgramIdOrderByCycleIdAsc(Long programId);
}
