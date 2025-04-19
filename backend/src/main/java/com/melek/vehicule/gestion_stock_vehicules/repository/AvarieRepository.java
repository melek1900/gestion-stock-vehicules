package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.model.Avarie;
import com.melek.vehicule.gestion_stock_vehicules.model.StatutAvarie;
import com.melek.vehicule.gestion_stock_vehicules.model.Vehicule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvarieRepository extends JpaRepository<Avarie, Long> {
    List<Avarie> findByVehiculeId(Long vehiculeId);
    List<Avarie> findByVehiculeAndStatut(Vehicule vehicule, StatutAvarie statut);

}
