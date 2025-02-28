package com.melek.vehicule.gestion_stock_vehicules.dto;

import java.util.List;

public class TransfertRequest {
    private List<Long> vehiculeIds;  // IDs des véhicules à transférer
    private Long parcDestinationId;  // ID du parc de destination

    public TransfertRequest() {}

    public TransfertRequest(List<Long> vehiculeIds, Long parcDestinationId) {
        this.vehiculeIds = vehiculeIds;
        this.parcDestinationId = parcDestinationId;
    }

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
}
