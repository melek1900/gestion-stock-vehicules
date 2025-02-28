package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.dto.TransfertRequest;
import com.melek.vehicule.gestion_stock_vehicules.model.Transfert;
import com.melek.vehicule.gestion_stock_vehicules.service.TransfertService;
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

    public TransfertController(TransfertService transfertService) {
        this.transfertService = transfertService;
    }

    @PostMapping("/initier")
    public ResponseEntity<Map<String, String>> initierTransfert(@RequestBody TransfertRequest request) {
        transfertService.initierTransfert(request);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Transfert initié avec succès !");

        return ResponseEntity.ok(response);  // ✅ Retourne un objet JSON
    }

    @PutMapping("/receptionner/{transfertId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_GESTIONNAIRE_STOCK')")
    public ResponseEntity<Map<String, String>> receptionnerTransfert(@PathVariable Long transfertId) {
        transfertService.receptionnerTransfert(transfertId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Transfert réceptionné avec succès !");

        return ResponseEntity.ok(response);  // ✅ Retourne un JSON valide
    }

    @GetMapping
    public ResponseEntity<List<Transfert>> getAllTransferts() {
        return ResponseEntity.ok(transfertService.getAllTransferts());
    }
}
