package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.model.Parc;
import com.melek.vehicule.gestion_stock_vehicules.model.TypeParc;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface ParcRepository extends JpaRepository<Parc, Long> {
    Optional<Parc> findByNom(String nom);
    List<Parc> findByTypeParc(TypeParc typeParc);
    List<Parc> findByNomIn(List<String> noms);
    Optional<Parc> findByNomIgnoreCase(String nom);

}
