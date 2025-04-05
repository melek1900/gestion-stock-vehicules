package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.model.Parc;
import com.melek.vehicule.gestion_stock_vehicules.model.Utilisateur;
import com.melek.vehicule.gestion_stock_vehicules.repository.ParcRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
@RestController
public class UtilisateurController {
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    @GetMapping("/api/utilisateurs/parcs-accessibles")
    public ResponseEntity<?> getParcsAccessibles(Authentication authentication) {
        String email = authentication.getName();

        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<Parc> parcsAcces = utilisateur.getParcsAcces();

        return ResponseEntity.ok(parcsAcces);
    }
    @GetMapping("/api/utilisateurs/marques-accessibles")
    public ResponseEntity<?> getMarquesDisponibles() {
        List<String> marques = List.of("GM", "ISUZU", "CHEVROLET");
        return ResponseEntity.ok(marques);
    }
}
