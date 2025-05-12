package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.dto.StatistiqueParMarqueDTO;
import com.melek.vehicule.gestion_stock_vehicules.model.StatutVehicule;
import com.melek.vehicule.gestion_stock_vehicules.model.Vehicule;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface VehiculeRepository extends JpaRepository <Vehicule , Long> {
    List<Vehicule> findByParcNom(String parcNom);
    List<Vehicule> findByParcId(Long parcId);
    List<Vehicule> findByParcIdIn(List<Long> ids);
   boolean existsByNumeroChassis(String numeroChassis);
    Optional<Vehicule> findByNumeroChassis(String numeroChassis);
    List<Vehicule> findByStatut(StatutVehicule statut);
    @Query("SELECT new map(v.parc.nom as parc, COUNT(v) as count) FROM Vehicule v GROUP BY v.parc.nom")
    List<Map<String, Object>> countVehiculesGroupedByParc();
    @Query("SELECT new com.melek.vehicule.gestion_stock_vehicules.dto.StatistiqueParMarqueDTO(v.shortDescription, COUNT(v)) " +
            "FROM Vehicule v GROUP BY v.shortDescription")
    List<StatistiqueParMarqueDTO> getStatistiquesParMarque();
    @Modifying
    @Transactional
    @Query("UPDATE Vehicule v SET v.statut = :statut WHERE v.numeroChassis = :numeroChassis")
    void updateStatut(@Param("statut") StatutVehicule statut, @Param("numeroChassis") String numeroChassis);

    @Query("SELECT v.shortDescription AS marque, v.parc.nom AS parc, COUNT(v) AS count " +
            "FROM Vehicule v " +
            "GROUP BY v.shortDescription, v.parc.nom")
    List<Object[]> getStockParcParMarque();

    @Query("SELECT v.statut, COUNT(v) FROM Vehicule v GROUP BY v.statut")
    List<Object[]> countVehiculesByStatut();
    List<Vehicule> findByParcIdInAndShortDescriptionIn(List<Long> parcIds, List<String> marques);
    List<Vehicule> findBySousParcNomIgnoreCase(String nom);
    List<Vehicule> findBySousParc_Parc_NomIgnoreCase(String parcNom);


}
