package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.model.DemandeExpertise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DemandeExpertiseRepository extends JpaRepository<DemandeExpertise, Long> {
    List<DemandeExpertise> findByVehiculeId(Long vehiculeId);
}
