package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.model.Mouvement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MouvementRepository extends JpaRepository<Mouvement, Long> {

    // Liste des mouvements pour un véhicule
    List<Mouvement> findByNumeroChassisOrderByDateMouvementDesc(String numeroChassis);

    // Dernier numéro de séquence pour un véhicule
    int countByNumeroChassis(String numeroChassis);
}
