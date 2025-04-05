package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.dto.StatVenteParModeleDTO;
import com.melek.vehicule.gestion_stock_vehicules.model.Vente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VenteRepository extends JpaRepository<Vente, Long> {
    @Query("""
    SELECT new com.melek.vehicule.gestion_stock_vehicules.dto.StatVenteParModeleDTO(v.modele, SUM(v.TotalVendu))
    FROM Vente v
    WHERE (:marque IS NULL OR v.marque = :marque)
    GROUP BY v.modele
    """)
    List<StatVenteParModeleDTO> sumVenteByModeleFiltered(@Param("marque") String marque);
}
