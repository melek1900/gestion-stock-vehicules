package com.melek.vehicule.gestion_stock_vehicules.repository;

import com.melek.vehicule.gestion_stock_vehicules.model.Photo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PhotoRepository extends JpaRepository<Photo, Long> {
    Optional<Photo> findByFileName(String fileName);

}
