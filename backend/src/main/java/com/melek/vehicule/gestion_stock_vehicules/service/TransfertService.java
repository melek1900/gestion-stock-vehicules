package com.melek.vehicule.gestion_stock_vehicules.service;

import com.melek.vehicule.gestion_stock_vehicules.dto.PreparationRequest;
import com.melek.vehicule.gestion_stock_vehicules.dto.TransfertRequest;
import com.melek.vehicule.gestion_stock_vehicules.model.*;
import com.melek.vehicule.gestion_stock_vehicules.repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class TransfertService {

    private final TransfertRepository transfertRepository;
    private final VehiculeRepository vehiculeRepository;
    private final ParcRepository parcRepository;

    public TransfertService(TransfertRepository transfertRepository, VehiculeRepository vehiculeRepository, ParcRepository parcRepository) {
        this.transfertRepository = transfertRepository;
        this.vehiculeRepository = vehiculeRepository;
        this.parcRepository = parcRepository;
    }

    @Transactional
    public void initierTransfert(TransfertRequest request) {
        List<Vehicule> vehicules = vehiculeRepository.findAllById(request.getVehiculeIds());

        if (vehicules.isEmpty()) {
            throw new EntityNotFoundException("Aucun véhicule trouvé !");
        }

        Transfert transfert = new Transfert();
        transfert.setVehicules(vehicules);
        transfert.setParcDestination(parcRepository.findById(request.getParcDestinationId())
                .orElseThrow(() -> new EntityNotFoundException("Parc destination non trouvé")));
        transfert.setStatut(StatutTransfert.EN_TRANSIT);
        transfert.setDateTransfert(new Date());

        transfertRepository.save(transfert);

        // ✅ Mettre à jour chaque véhicule en "TRANSFERT"
        vehicules.forEach(v -> v.setStatut(StatutVehicule.TRANSFERT));
        vehiculeRepository.saveAll(vehicules);
    }
    @Transactional
    public void receptionnerTransfert(Long vehiculeId) {
        Vehicule vehicule = vehiculeRepository.findById(vehiculeId)
                .orElseThrow(() -> new EntityNotFoundException("Véhicule non trouvé !"));

        if (!vehicule.getStatut().equals(StatutVehicule.TRANSFERT)) {
            throw new IllegalArgumentException("Le véhicule n'est pas en transit !");
        }

        // ✅ Met à jour le statut et le parc de destination
        vehicule.setStatut(StatutVehicule.EN_PREPARATION);
        vehicule.setParc(parcRepository.findById(2L)
                .orElseThrow(() -> new EntityNotFoundException("Parc 2 non trouvé")));

        vehiculeRepository.save(vehicule);
    }
    public List<Transfert> getAllTransferts() {
        return transfertRepository.findAll();
    }
}
