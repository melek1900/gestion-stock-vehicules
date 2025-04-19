package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.dto.RotationStockStatDTO;
import com.melek.vehicule.gestion_stock_vehicules.model.RotationStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RotationStockRepository extends JpaRepository<RotationStock, Long> {
    @Query(value = """
    SELECT
        MONTHNAME(r.date) AS mois,
        r.marque AS marque,
        SUM(r.quantite_vendue) AS quantiteVendue
    FROM
        rotation_stock r
    GROUP BY
        mois, r.marque
    ORDER BY
        MONTH(r.date)
""", nativeQuery = true)
    List<RotationStockStatDTO> findQuantiteVendueParMoisEtMarqueRaw();

    @Query(value = """
    SELECT 
        MONTHNAME(r.date) AS mois,
        r.marque AS marque,
        SUM(r.quantite_vendue) / NULLIF(SUM(r.quantite_achetee), 0) AS taux
    FROM rotation_stock r
    WHERE (:marque IS NULL OR r.marque = :marque)
    GROUP BY mois, r.marque
    ORDER BY MONTH(r.date)
    """, nativeQuery = true)
    List<Object[]> findTauxRotationQuantite(@Param("marque") String marque);

    @Query(value = """
SELECT 
    MONTHNAME(r.date) AS mois,
    r.marque AS marque,
    SUM(r.valeur_vente) / NULLIF(SUM(r.valeur_achat), 0) AS taux
FROM rotation_stock r
WHERE (:marque IS NULL OR r.marque = :marque)
GROUP BY mois, r.marque
ORDER BY MONTH(r.date)
""", nativeQuery = true)
    List<Object[]> findTauxRotationValeur(@Param("marque") String marque);
}
