package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.model.Parc;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParcRepository extends JpaRepository<Parc, Long> {
}
