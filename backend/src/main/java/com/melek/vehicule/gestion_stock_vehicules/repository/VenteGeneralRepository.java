package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.dto.StatVenteParGenreDTO;
import com.melek.vehicule.gestion_stock_vehicules.dto.StatVenteParGenreParMarqueDTO;
import com.melek.vehicule.gestion_stock_vehicules.dto.StatVenteParModeleDTO;
import com.melek.vehicule.gestion_stock_vehicules.model.VenteGeneral;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VenteGeneralRepository extends JpaRepository<VenteGeneral, Long> {

    @Query("SELECT new com.melek.vehicule.gestion_stock_vehicules.dto.StatVenteParGenreParMarqueDTO(" +
            "vg.Genre, vg.marque, SUM(vg.TotalVendu)) " +
            "FROM VenteGeneral vg " +
            "WHERE vg.marque NOT IN ('ISUZU', 'CHEVROLET') AND vg.marque IN :marques " +
            "GROUP BY vg.Genre, vg.marque")
    List<StatVenteParGenreParMarqueDTO> findVentesParGenrePourConcurrence(@Param("marques") List<String> marques);



    @Query("SELECT new com.melek.vehicule.gestion_stock_vehicules.dto.StatVenteParGenreParMarqueDTO(" +
            "vg.marque, vg.Genre, SUM(vg.TotalVendu)) " +
            "FROM VenteGeneral vg " +
            "WHERE vg.marque IN :marques " +
            "GROUP BY vg.marque, vg.Genre")
    List<StatVenteParGenreParMarqueDTO> findVentesParGenreParMarques(@Param("marques") List<String> marques);
}

