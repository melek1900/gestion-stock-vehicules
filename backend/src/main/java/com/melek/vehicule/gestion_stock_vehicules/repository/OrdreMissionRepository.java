package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.model.OrdreMission;
import com.melek.vehicule.gestion_stock_vehicules.model.StatutOrdreMission;
import com.melek.vehicule.gestion_stock_vehicules.model.Vehicule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrdreMissionRepository extends JpaRepository<OrdreMission, Long> {
    Optional<OrdreMission> findByNumeroOrdre(String numeroOrdre);
    @Query("SELECT o.statut, COUNT(o) FROM OrdreMission o GROUP BY o.statut")
    List<Object[]> countByStatut();
    boolean existsByVehiculesContainingAndStatutNot(Vehicule vehicule, StatutOrdreMission statut);

}
