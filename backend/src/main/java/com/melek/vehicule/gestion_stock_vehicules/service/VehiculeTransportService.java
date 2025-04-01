package com.melek.vehicule.gestion_stock_vehicules.service;

import com.melek.vehicule.gestion_stock_vehicules.model.VehiculeTransport;
import com.melek.vehicule.gestion_stock_vehicules.repository.VehiculeTransportRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehiculeTransportService {


    private final VehiculeTransportRepository repository;

    public VehiculeTransportService(VehiculeTransportRepository repository) {
        this.repository = repository;
    }

    public List<VehiculeTransport> getAll() {
        return repository.findAll();
    }

    public VehiculeTransport getById(Long id) {
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Non trouvé"));
    }

    public VehiculeTransport create(VehiculeTransport v) {
        return repository.save(v);
    }

    public VehiculeTransport update(Long id, VehiculeTransport updated) {
        VehiculeTransport existing = getById(id);
        existing.setMatricule(updated.getMatricule());
        existing.setCapacite(updated.getCapacite());
        existing.setType(updated.getType());
        existing.setDisponible(updated.isDisponible());
        return repository.save(existing);
    }

    public void delete(Long id) {
        try {
            repository.deleteById(id);
        } catch (DataIntegrityViolationException e) {
            throw new RuntimeException("Ce véhicule est utilisé dans une ou plusieurs missions. Suppression impossible.");
        }
    }

    public List<VehiculeTransport> getDisponibles() {
        return repository.findByDisponibleTrue();
    }
}
