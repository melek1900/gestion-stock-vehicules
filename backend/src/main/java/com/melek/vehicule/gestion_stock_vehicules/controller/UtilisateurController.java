package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.dto.UtilisateurDTO;
import com.melek.vehicule.gestion_stock_vehicules.model.Parc;
import com.melek.vehicule.gestion_stock_vehicules.model.RoleUtilisateur;
import com.melek.vehicule.gestion_stock_vehicules.model.Utilisateur;
import com.melek.vehicule.gestion_stock_vehicules.repository.UtilisateurRepository;
import com.melek.vehicule.gestion_stock_vehicules.service.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
public class UtilisateurController {
    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    private UtilisateurService utilisateurService;

    @GetMapping
    public ResponseEntity<List<UtilisateurDTO>> getAllUtilisateurs() {
        return ResponseEntity.ok(utilisateurService.getAllUtilisateurs());
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerUtilisateur(@PathVariable Long id) {
        utilisateurService.supprimer(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<Utilisateur> enregistrerUtilisateur(@RequestBody Utilisateur utilisateur) {
        return ResponseEntity.ok(utilisateurService.enregistrer(utilisateur));
    }
    @GetMapping("/roles")
    public ResponseEntity<List<String>> getRoles() {
        return ResponseEntity.ok(Arrays.stream(RoleUtilisateur.values()).map(Enum::name).toList());
    }
    @PutMapping("/{id}")
    public ResponseEntity<Utilisateur> modifierUtilisateur(@PathVariable Long id, @RequestBody UtilisateurDTO dto) {
        return utilisateurRepository.findById(id)
                .map(existing -> {
                    existing.setNom(dto.getNom());
                    existing.setPrenom(dto.getPrenom());
                    existing.setEmail(dto.getEmail());
                    existing.setRole(dto.getRole());

                    // 🧠 Met à jour les parcs accessibles via leurs noms
                    List<Parc> parcs = utilisateurService.getParcsByNoms(dto.getParcsAccessibles());
                    existing.setParcsAcces(parcs);

                    // 🧠 Idem pour les marques
                    existing.setMarquesAccessibles(dto.getMarquesAccessibles());

                    return ResponseEntity.ok(utilisateurRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
    @GetMapping("/parcs-accessibles")
    public ResponseEntity<?> getParcsAccessibles(Authentication authentication) {
        String email = authentication.getName();

        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<Parc> parcsAcces = utilisateur.getParcsAcces();

        return ResponseEntity.ok(parcsAcces);
    }
    @GetMapping("/marques-accessibles")
    public ResponseEntity<?> getMarquesDisponibles() {
        List<String> marques = List.of("GM", "ISUZU", "CHEVROLET");
        return ResponseEntity.ok(marques);
    }

}
