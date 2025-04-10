package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.model.Chauffeur;
import com.melek.vehicule.gestion_stock_vehicules.model.Marque;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface MarqueRepository extends JpaRepository<Marque, Long> {
    Optional<Marque> findByNom(String nom);
    List<Marque> findByNomIn(Set<String> noms);
    boolean existsByNomIgnoreCase(String nom);

}
