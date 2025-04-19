package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.dto.StatVenteParRegionDTO;
import com.melek.vehicule.gestion_stock_vehicules.model.VenteRegion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenteRegionRepository extends JpaRepository<VenteRegion, Long> {
    @Query("""
        SELECT new com.melek.vehicule.gestion_stock_vehicules.dto.StatVenteParRegionDTO(v.region, SUM(v.totalVendu))
        FROM VenteRegion v
        WHERE (:marque IS NULL OR v.marque = :marque)
        GROUP BY v.region
    """)
    List<StatVenteParRegionDTO> sumVenteByRegionFiltered(@Param("marque") String marque);
}
