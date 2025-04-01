package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.model.DemandeExpertise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface DemandeExpertiseRepository extends JpaRepository<DemandeExpertise, Long> {
    List<DemandeExpertise> findByVehiculeId(Long vehiculeId);
}
