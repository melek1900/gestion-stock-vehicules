package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.model.Parc;
import com.melek.vehicule.gestion_stock_vehicules.model.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {
    Optional<Stock> findByParc(Parc parc); // ✅ Ajout de la recherche par parc
    Optional<Stock> findTopByOrderByIdAsc();

}
