package com.melek.vehicule.gestion_stock_vehicules.dto;

import java.util.List;

public class TransfertRequest {
    private List<Long> vehiculeIds;
    private Long parcDestinationId;
    private Long chauffeurId;

    public Long getChauffeurId() {
        return chauffeurId;
    }

    public void setChauffeurId(Long chauffeurId) {
        this.chauffeurId = chauffeurId;
    }

    public Long getVehiculeTransportId() {
        return vehiculeTransportId;
    }

    public void setVehiculeTransportId(Long vehiculeTransportId) {
        this.vehiculeTransportId = vehiculeTransportId;
    }

    private Long vehiculeTransportId;
    private Long ordreMissionId;  // ✅ Ajout de l'ID de l'ordre de mission

    // ✅ Constructeur par défaut
    public TransfertRequest() {}

    // ✅ Constructeur avec paramètres
    public TransfertRequest(List<Long> vehiculeIds, Long parcDestinationId, Long ordreMissionId) {
        this.vehiculeIds = vehiculeIds;
        this.parcDestinationId = parcDestinationId;
        this.ordreMissionId = ordreMissionId;
    }

    // ✅ Getters et Setters
    public List<Long> getVehiculeIds() {
        return vehiculeIds;
    }

    public void setVehiculeIds(List<Long> vehiculeIds) {
        this.vehiculeIds = vehiculeIds;
    }

    public Long getParcDestinationId() {
        return parcDestinationId;
    }

    public void setParcDestinationId(Long parcDestinationId) {
        this.parcDestinationId = parcDestinationId;
    }

    public Long getOrdreMissionId() {
        return ordreMissionId;
    }

    public void setOrdreMissionId(Long ordreMissionId) {
        this.ordreMissionId = ordreMissionId;
    }
}
