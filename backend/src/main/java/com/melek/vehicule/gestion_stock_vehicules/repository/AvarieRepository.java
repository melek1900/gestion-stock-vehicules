package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.model.Avarie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvarieRepository extends JpaRepository<Avarie, Long> {
    List<Avarie> findByVehiculeId(Long vehiculeId);
}
