package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.model.CompteurImport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompteurImportRepository extends JpaRepository<CompteurImport, Long> {
    Optional<CompteurImport> findByAnnee(String annee);
}
