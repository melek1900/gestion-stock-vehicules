package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.dto.RotationStockTauxDTO;
import com.melek.vehicule.gestion_stock_vehicules.service.RotationStockService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rotation-stock/taux")
@RequiredArgsConstructor
public class RotationStockTauxController {

    private final RotationStockService service;

    @GetMapping("/quantite")
    public List<RotationStockTauxDTO> tauxParQuantite(@RequestParam String marque) {
        return service.getTauxRotationQuantite(marque);
    }

    @GetMapping("/valeur")
    public List<RotationStockTauxDTO> tauxParValeur(@RequestParam String marque) {
        return service.getTauxRotationValeur(marque);
    }
}
