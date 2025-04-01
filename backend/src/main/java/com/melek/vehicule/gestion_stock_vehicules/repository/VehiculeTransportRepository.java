package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.model.VehiculeTransport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VehiculeTransportRepository extends JpaRepository<VehiculeTransport, Long> {
    List<VehiculeTransport> findByDisponibleTrue(); // ✅ Récupérer uniquement les véhicules disponibles
}
