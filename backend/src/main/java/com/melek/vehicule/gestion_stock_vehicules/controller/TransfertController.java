package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.dto.TransfertRequest;
import com.melek.vehicule.gestion_stock_vehicules.model.OrdreMission;
import com.melek.vehicule.gestion_stock_vehicules.model.Parc;
import com.melek.vehicule.gestion_stock_vehicules.model.Transfert;
import com.melek.vehicule.gestion_stock_vehicules.repository.ParcRepository;
import com.melek.vehicule.gestion_stock_vehicules.service.OrdreMissionPDFService;
import com.melek.vehicule.gestion_stock_vehicules.service.TransfertService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transferts")
public class TransfertController {

    private final TransfertService transfertService;
    private final ParcRepository parcRepository;
    private final OrdreMissionPDFService ordreMissionPDFService;
    public TransfertController(TransfertService transfertService,ParcRepository parcRepository,OrdreMissionPDFService ordreMissionPDFService) {
        this.transfertService = transfertService;
        this.parcRepository=parcRepository;
        this.ordreMissionPDFService=ordreMissionPDFService;
    }
    @GetMapping("/parcs-disponibles/{parcId}")
    public ResponseEntity<List<Parc>> getParcsDisponibles(@PathVariable Long parcId) {
        List<Parc> parcs = parcRepository.findAll().stream()
                .filter(parc -> !parc.getNom().equalsIgnoreCase("AUPORT") && parc.getId() != parcId)
                .toList();
        return ResponseEntity.ok(parcs);
    }
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_GESTIONNAIRE_STOCK')")
    @PostMapping("/initier")
    public ResponseEntity<Map<String, Object>> initierTransfert(@RequestBody TransfertRequest request) {
        OrdreMission ordreMission = transfertService.creerOrdreMission(
                request.getVehiculeIds(),
                request.getChauffeurId(),
                request.getVehiculeTransportId(),
                request.getParcDestinationId()
        );

        if (ordreMission == null || ordreMission.getId() == null) {
            System.err.println("❌ L'ordre de mission n'a pas été créé correctement !");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Échec de la création de l'ordre de mission"));
        }

        System.out.println("✅ OrdreMission créé avec ID : " + ordreMission.getId());

        byte[] pdfBytes;
        try {
            pdfBytes = ordreMissionPDFService.generateOrdreMissionPDF(ordreMission);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Erreur lors de la génération du PDF"));
        }

        String pdfUrl = "http://localhost:8080/api/ordre-mission/" + ordreMission.getId() + "/pdf";
        System.out.println("📂 PDF URL générée : " + pdfUrl);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "✅ Transfert initié avec succès !");
        response.put("ordreMissionId", ordreMission.getId());
        response.put("pdfUrl", pdfUrl);

        return ResponseEntity.ok(response);
    }


    @PutMapping("/receptionner/{transfertId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_GESTIONNAIRE_STOCK')")
    public ResponseEntity<Map<String, String>> receptionnerTransfert(@PathVariable Long transfertId) {
        transfertService.receptionnerTransfert(transfertId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "✅ Transfert réceptionné avec succès !");
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<Transfert>> getAllTransferts() {
        return ResponseEntity.ok(transfertService.getAllTransferts());
    }
}
