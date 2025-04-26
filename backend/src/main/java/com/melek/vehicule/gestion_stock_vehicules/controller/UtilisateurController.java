package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.dto.UtilisateurDTO;
import com.melek.vehicule.gestion_stock_vehicules.model.Parc;
import com.melek.vehicule.gestion_stock_vehicules.model.Marque;
import com.melek.vehicule.gestion_stock_vehicules.model.RoleUtilisateur;
import com.melek.vehicule.gestion_stock_vehicules.model.Utilisateur;
import com.melek.vehicule.gestion_stock_vehicules.repository.ParcRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.UtilisateurRepository;
import com.melek.vehicule.gestion_stock_vehicules.service.UtilisateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;
import com.melek.vehicule.gestion_stock_vehicules.repository.MarqueRepository;

@RestController
@RequestMapping("/api/utilisateurs")
public class UtilisateurController {
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private MarqueRepository marqueRepository;

    @Autowired
    private UtilisateurService utilisateurService;
    public UtilisateurController(
                                 PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }
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
    @GetMapping("/admin-exists")
    public boolean adminExists() {
        return utilisateurRepository.existsByRole(RoleUtilisateur.ROLE_ADMINISTRATEUR);
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
    public List<String> getMarquesDisponibles() {
        return marqueRepository.findAll()
                .stream()
                .map(Marque::getNom)
                .collect(Collectors.toList());
    }
    @GetMapping("/me")
    public ResponseEntity<UtilisateurDTO> getUtilisateurConnecte(Authentication authentication) {
        String email = authentication.getName();

        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        UtilisateurDTO dto = new UtilisateurDTO();
        dto.setId(utilisateur.getId());
        dto.setNom(utilisateur.getNom());
        dto.setPrenom(utilisateur.getPrenom());
        dto.setEmail(utilisateur.getEmail());
        dto.setRole(utilisateur.getRole());
        dto.setParcNom(utilisateur.getParc() != null ? utilisateur.getParc().getNom() : null);
        dto.setParcsAccessibles(utilisateur.getParcsAcces().stream().map(Parc::getNom).toList());
        dto.setMarquesAccessibles(utilisateur.getMarquesAccessibles().stream().map(m -> m.getNom()).collect(Collectors.toSet()));

        return ResponseEntity.ok(dto);
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfil(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        utilisateur.setNom((String) request.get("nom"));
        utilisateur.setPrenom((String) request.get("prenom"));
        utilisateur.setEmail((String) request.get("email"));

        if (request.containsKey("role")) {
            utilisateur.setRole(RoleUtilisateur.valueOf((String) request.get("role")));
        }

        if (request.containsKey("parcsAccessibles")) {
            List<String> parcsNoms = (List<String>) request.get("parcsAccessibles");
            utilisateur.setParcsAcces(utilisateurService.getParcsByNoms(parcsNoms));
        }

        if (request.containsKey("marquesAccessibles")) {
            Set<String> marques = new HashSet<>((List<String>) request.get("marquesAccessibles"));
            utilisateur.setMarquesAccessibles(marques.stream()
                    .map(nom -> marqueRepository.findByNom(nom)
                            .orElseThrow(() -> new RuntimeException("Marque introuvable : " + nom)))
                    .collect(Collectors.toSet()));
        }

        if (request.containsKey("motDePasse")) {
            String nouveauMotDePasse = (String) request.get("motDePasse");
            if (nouveauMotDePasse != null && !nouveauMotDePasse.isBlank()) {
                utilisateur.setMotDePasse(passwordEncoder.encode(nouveauMotDePasse));
            }
        }

        utilisateurRepository.save(utilisateur);
        return ResponseEntity.ok(Map.of("message", "Profil mis à jour"));
    }

}
