package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.dto.StatVenteParEnergieDTO;
import com.melek.vehicule.gestion_stock_vehicules.model.VenteEnergie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VenteEnergieRepository extends JpaRepository<VenteEnergie, Long> {
    @Query("""
        SELECT new com.melek.vehicule.gestion_stock_vehicules.dto.StatVenteParEnergieDTO(v.energie, SUM(v.totalVendu))
        FROM VenteEnergie v
        WHERE (:marque IS NULL OR v.marque = :marque)
        GROUP BY v.energie
    """)
    List<StatVenteParEnergieDTO> sumVenteByEnergieFiltered(@Param("marque") String marque);
}
