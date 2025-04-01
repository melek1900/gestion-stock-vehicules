package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.model.VehiculeTransport;
import com.melek.vehicule.gestion_stock_vehicules.service.VehiculeTransportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicules-transport")
public class VehiculeTransportController {

    private final VehiculeTransportService service;

    public VehiculeTransportController(VehiculeTransportService service) {
        this.service = service;
    }

    @GetMapping
    public List<VehiculeTransport> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public VehiculeTransport getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public VehiculeTransport create(@RequestBody VehiculeTransport vehicule) {
        return service.create(vehicule);
    }

    @PutMapping("/{id}")
    public VehiculeTransport update(@PathVariable Long id, @RequestBody VehiculeTransport updated) {
        return service.update(id, updated);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/disponibles")
    public List<VehiculeTransport> getDisponibles() {
        return service.getDisponibles();
    }
}
