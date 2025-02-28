package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.model.Avarie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AvarieRepository extends JpaRepository<Avarie, Long> {
    List<Avarie> findByVehiculeId(Long vehiculeId);
}
