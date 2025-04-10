package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.dto.JwtResponse;
import com.melek.vehicule.gestion_stock_vehicules.dto.LoginRequest;
import com.melek.vehicule.gestion_stock_vehicules.model.Marque;
import com.melek.vehicule.gestion_stock_vehicules.model.Parc;
import com.melek.vehicule.gestion_stock_vehicules.model.RoleUtilisateur;
import com.melek.vehicule.gestion_stock_vehicules.model.Utilisateur;
import com.melek.vehicule.gestion_stock_vehicules.repository.MarqueRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.ParcRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.UtilisateurRepository;
import com.melek.vehicule.gestion_stock_vehicules.security.JwtUtil;
import com.melek.vehicule.gestion_stock_vehicules.service.UtilisateurService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UtilisateurService utilisateurService;
    private final JwtUtil jwtUtil;
    private final UtilisateurRepository utilisateurRepository;
    private final ParcRepository parcRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final MarqueRepository marqueRepository;


    // Ajoute AuthenticationManager dans le constructeur
    public AuthController(UtilisateurService utilisateurService, JwtUtil jwtUtil,
                          UtilisateurRepository utilisateurRepository, ParcRepository parcRepository,PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager,MarqueRepository marqueRepository) {
        this.utilisateurService = utilisateurService;
        this.jwtUtil = jwtUtil;
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;  // Injecte AuthenticationManager
        this.parcRepository=parcRepository;
        this.marqueRepository=marqueRepository;

    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            System.out.println("🔍 Tentative de connexion : " + loginRequest.getEmail());

            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            Utilisateur utilisateur = utilisateurRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            // ✅ Récupération du parc de travail
            String parcNom = utilisateur.getParc() != null ? utilisateur.getParc().getNom() : null;
            System.out.println("🔍 Parc récupéré depuis la base : " + parcNom);

            // ✅ Récupération des noms des parcs accessibles
            List<String> parcsAccesNoms = utilisateur.getParcsAcces().stream()
                    .map(Parc::getNom)
                    .collect(Collectors.toList());
            System.out.println("🔍 Parcs accessibles récupérés : " + parcsAccesNoms);

            // ✅ Récupération des marques accessibles dynamiques
            List<String> marquesAccessibles = utilisateur.getMarquesAccessibles().stream()
                    .map(Marque::getNom)
                    .collect(Collectors.toList());
            System.out.println("🎯 Marques accessibles depuis la BDD : " + marquesAccessibles);

            // ✅ Génération du token avec parc, parcsAcces et marquesAccessibles
            String token = jwtUtil.generateToken(authentication, parcNom, parcsAccesNoms, marquesAccessibles);

            System.out.println("✅ Token généré avec succès !");
            return ResponseEntity.ok(new JwtResponse(token));

        } catch (Exception e) {
            System.out.println("❌ ERREUR : Échec de connexion - " + e.getMessage());
            return ResponseEntity.status(401).body(Map.of("message", "⚠️ Identifiants incorrects."));
        }
    }



    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> request) {
        String nom = (String) request.get("nom");
        String prenom = (String) request.get("prenom");
        String email = (String) request.get("email");
        String motDePasse = (String) request.get("motDePasse");
        String roleStr = (String) request.get("role");

        Long parcId = request.get("parc") != null ? Long.valueOf(request.get("parc").toString()) : null;
        List<Long> parcsAccesIds = (List<Long>) request.get("parcsAcces");

        if (nom == null || prenom == null || email == null || motDePasse == null || roleStr == null) {
            return ResponseEntity.status(400).body("Tous les champs doivent être renseignés");
        }

        Parc parc = null;
        List<Parc> parcsAcces = new ArrayList<>();

        if (!roleStr.equals("ROLE_ADMIN")) {
            if (parcId == null) {
                return ResponseEntity.status(400).body("Le parc est obligatoire pour ce rôle.");
            }
            parc = parcRepository.findById(parcId).orElseThrow(() -> new RuntimeException("Parc introuvable"));

            if (parcsAccesIds != null) {
                parcsAcces = parcRepository.findAllById(parcsAccesIds);
            }
        }
        List<String> marquesStr = (List<String>) request.get("marquesAccessibles");
        Set<Marque> marquesAccessibles = new HashSet<>();

        if (marquesStr != null) {
            marquesAccessibles = marquesStr.stream()
                    .map(nomMarque  -> marqueRepository.findByNom(nomMarque)
                            .orElseThrow(() -> new RuntimeException("Marque introuvable : " + nomMarque)))
                    .collect(Collectors.toSet());
        }


        Utilisateur utilisateur = new Utilisateur(nom, prenom, email, passwordEncoder.encode(motDePasse), RoleUtilisateur.valueOf(roleStr), parc);
        utilisateur.setParcsAcces(parcsAcces);
        utilisateur.setMarquesAccessibles(marquesAccessibles);

        utilisateurRepository.save(utilisateur);

        return ResponseEntity.status(201).body(Map.of("message", "Utilisateur enregistré"));
    }



}
