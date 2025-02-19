package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.dto.JwtResponse;
import com.melek.vehicule.gestion_stock_vehicules.dto.LoginRequest;
import com.melek.vehicule.gestion_stock_vehicules.model.Utilisateur;
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

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UtilisateurService utilisateurService;
    private final JwtUtil jwtUtil;
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;  // Ajoute l'injection de AuthenticationManager

    // Ajoute AuthenticationManager dans le constructeur
    public AuthController(UtilisateurService utilisateurService, JwtUtil jwtUtil,
                          UtilisateurRepository utilisateurRepository, PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager) {
        this.utilisateurService = utilisateurService;
        this.jwtUtil = jwtUtil;
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;  // Injecte AuthenticationManager
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        System.out.println("Login Request - Email: " + loginRequest.getEmail() + ", Password: " + loginRequest.getPassword()); // Add this log
        // Authentifier l'utilisateur
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));


        // Générer un token JWT
        String token = jwtUtil.generateToken(authentication);

        return ResponseEntity.ok(new JwtResponse(token));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Utilisateur utilisateur) {
        // Vérifie que tous les champs sont remplis
        if (utilisateur.getNom() == null || utilisateur.getPrenom() == null || utilisateur.getEmail() == null || utilisateur.getMotDePasse() == null || utilisateur.getRole()==null) {
            return ResponseEntity.status(400).body("Tous les champs doivent être renseignés");
        }
        if (utilisateurRepository.findByEmail(utilisateur.getEmail()).isPresent()) {
            return ResponseEntity.status(400).body("Un utilisateur avec cet email existe déjà");
        }
        // Encoder le mot de passe avant d'enregistrer l'utilisateur
        utilisateur.setMotDePasse(passwordEncoder.encode(utilisateur.getMotDePasse()));

        Utilisateur savedUser = utilisateurRepository.save(utilisateur);
        return ResponseEntity.status(201).body(Map.of("message", "Utilisateur enregistré", "userId", savedUser.getId()));

    }
}
