package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.model.SousParc;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SousParcRepository extends JpaRepository<SousParc, Long> {
    List<SousParc> findByParcId(Long parcId);
    List<SousParc> findByParcNomIgnoreCase(String nom);
}
