package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.dto.JwtResponse;
import com.melek.vehicule.gestion_stock_vehicules.dto.LoginRequest;
import com.melek.vehicule.gestion_stock_vehicules.model.*;
import com.melek.vehicule.gestion_stock_vehicules.repository.MarqueRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.ParcRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.SessionRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.UtilisateurRepository;
import com.melek.vehicule.gestion_stock_vehicules.security.JwtUtil;
import com.melek.vehicule.gestion_stock_vehicules.service.UtilisateurService;
import jakarta.servlet.http.HttpServletRequest;
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
    private final SessionRepository sessionRepository;

    public AuthController(UtilisateurService utilisateurService, JwtUtil jwtUtil,
                          UtilisateurRepository utilisateurRepository, ParcRepository parcRepository,PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager,MarqueRepository marqueRepository,SessionRepository sessionRepository) {
        this.utilisateurService = utilisateurService;
        this.jwtUtil = jwtUtil;
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;  // Injecte AuthenticationManager
        this.parcRepository=parcRepository;
        this.marqueRepository=marqueRepository;
        this.sessionRepository=sessionRepository;

    }
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String token = jwtUtil.getTokenFromRequest(request);

        if (token != null) {
            sessionRepository.findByToken(token).ifPresent(session -> {
                session.setActive(false);
                session.setDateDeconnexion(new Date());
                sessionRepository.save(session);
            });
        }

        return ResponseEntity.ok(Map.of("message", "Déconnexion réussie"));
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

            // ✅ Récupération des noms des parcs accessibles
            List<String> parcsAccesNoms = utilisateur.getParcsAcces().stream()
                    .map(Parc::getNom)
                    .collect(Collectors.toList());

            // ✅ Récupération des marques accessibles dynamiques
            List<String> marquesAccessibles = utilisateur.getMarquesAccessibles().stream()
                    .map(Marque::getNom)
                    .collect(Collectors.toList());

            // ✅ Génération du token
            String token = jwtUtil.generateToken(authentication, parcNom, parcsAccesNoms, marquesAccessibles);

            // 🔁 Rechercher une session existante
            Optional<Session> existingSession = sessionRepository.findByUtilisateur(utilisateur);

            Session session = existingSession.orElseGet(Session::new);

            session.setDateConnexion(new Date());
            session.setActive(true);
            session.setUtilisateur(utilisateur);
            session.setToken(token);
            session.setDateDeconnexion(null); // remettre à null si nouvelle connexion

            sessionRepository.save(session);

            System.out.println("✅ Nouvelle session créée pour : " + utilisateur.getEmail());

            return ResponseEntity.ok(new JwtResponse(token));

        } catch (Exception e) {
            System.out.println("❌ Échec de connexion - " + e.getMessage());
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
