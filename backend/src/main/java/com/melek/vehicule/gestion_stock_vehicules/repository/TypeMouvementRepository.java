package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.model.TypeMouvement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TypeMouvementRepository extends JpaRepository<TypeMouvement, Long> {
    Optional<TypeMouvement> findByLibelTransact(String libelTransact);
}

