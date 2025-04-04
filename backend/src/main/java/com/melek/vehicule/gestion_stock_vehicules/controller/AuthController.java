package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.dto.JwtResponse;
import com.melek.vehicule.gestion_stock_vehicules.dto.LoginRequest;
import com.melek.vehicule.gestion_stock_vehicules.model.Parc;
import com.melek.vehicule.gestion_stock_vehicules.model.RoleUtilisateur;
import com.melek.vehicule.gestion_stock_vehicules.model.Utilisateur;
import com.melek.vehicule.gestion_stock_vehicules.repository.ParcRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.UtilisateurRepository;
import com.melek.vehicule.gestion_stock_vehicules.security.JwtUtil;
import com.melek.vehicule.gestion_stock_vehicules.service.UtilisateurService;
import org.springframework.context.support.BeanDefinitionDsl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UtilisateurService utilisateurService;
    private final JwtUtil jwtUtil;
    private final UtilisateurRepository utilisateurRepository;
    private final ParcRepository parcRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;  // Ajoute l'injection de AuthenticationManager

    // Ajoute AuthenticationManager dans le constructeur
    public AuthController(UtilisateurService utilisateurService, JwtUtil jwtUtil,
                          UtilisateurRepository utilisateurRepository, ParcRepository parcRepository,PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager) {
        this.utilisateurService = utilisateurService;
        this.jwtUtil = jwtUtil;
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;  // Injecte AuthenticationManager
        this.parcRepository=parcRepository;
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

            // ✅ Vérification de la récupération du parc de l'utilisateur
            String parcNom = utilisateur.getParc() != null ? utilisateur.getParc().getNom() : null;
            System.out.println("🔍 Parc récupéré depuis la base : " + parcNom);

            // ✅ Vérification de la récupération des parcs accessibles
            List<String> parcsAccesNoms = utilisateur.getParcsAcces()
                    .stream().map(Parc::getNom)
                    .collect(Collectors.toList());
            System.out.println("🔍 Parcs accessibles récupérés : " + parcsAccesNoms);

            // ✅ Vérification avant la génération du token
            if (parcNom == null) {
                System.out.println("❌ ERREUR : parcNom est NULL avant de générer le token !");
            }

            // ✅ Génération du token
            String token = jwtUtil.generateToken(authentication, parcNom, parcsAccesNoms);

            System.out.println("✅ Token généré avec parcNom : " + parcNom);
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

        Utilisateur utilisateur = new Utilisateur(nom, prenom, email, passwordEncoder.encode(motDePasse), RoleUtilisateur.valueOf(roleStr), parc);
        utilisateur.setParcsAcces(parcsAcces);

        utilisateurRepository.save(utilisateur);

        return ResponseEntity.status(201).body(Map.of("message", "Utilisateur enregistré"));
    }



}
