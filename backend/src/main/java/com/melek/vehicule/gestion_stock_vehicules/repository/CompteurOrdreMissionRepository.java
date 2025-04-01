package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.model.CompteurOrdreMission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompteurOrdreMissionRepository extends JpaRepository<CompteurOrdreMission, Long> {
    Optional<CompteurOrdreMission> findByAnnee(int annee);
}
