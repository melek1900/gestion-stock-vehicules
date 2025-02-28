package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.model.Transfert;
import com.melek.vehicule.gestion_stock_vehicules.model.Vehicule;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TransfertRepository extends JpaRepository<Transfert, Long> {
    @Modifying
    @Query("DELETE FROM TransfertVehicule tv WHERE tv.vehicule.id = :vehiculeId")
    void deleteTransfertRelationsByVehiculeId(@Param("vehiculeId") Long vehiculeId);

    @Modifying
    @Query("DELETE FROM Transfert t WHERE t.id NOT IN (SELECT tv.transfert.id FROM TransfertVehicule tv)")
    void deleteOrphanTransferts();
}
