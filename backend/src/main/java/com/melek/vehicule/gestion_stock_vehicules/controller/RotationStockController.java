package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.dto.RotationStockStatDTO;
import com.melek.vehicule.gestion_stock_vehicules.model.RotationStock;
import com.melek.vehicule.gestion_stock_vehicules.service.RotationStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rotation-stock/statistiques")
@RequiredArgsConstructor
public class RotationStockController {

    private final RotationStockService service;

    @GetMapping
    public List<RotationStock> getAll() {
        return service.getAll();
    }

    @PostMapping
    public RotationStock save(@RequestBody RotationStock rs) {
        return service.save(rs);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
    @GetMapping("/quantite-vendue")
    public List<RotationStockStatDTO> getStatQuantiteVendue() {
        return service.getQuantiteVendueParMoisEtMarque();
    }

}
