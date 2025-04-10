package com.melek.vehicule.gestion_stock_vehicules.service;

import com.melek.vehicule.gestion_stock_vehicules.dto.UtilisateurDTO;
import com.melek.vehicule.gestion_stock_vehicules.model.Marque;
import com.melek.vehicule.gestion_stock_vehicules.model.Utilisateur;
import com.melek.vehicule.gestion_stock_vehicules.repository.MarqueRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.ParcRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.melek.vehicule.gestion_stock_vehicules.model.Parc;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;


@Service
public class UtilisateurService implements UserDetailsService {

    private final UtilisateurRepository utilisateurRepository;

    @Autowired
    private ParcRepository parcRepository;

    @Autowired
    private MarqueRepository marqueRepository;

    public Set<Marque> getMarquesByNoms(Set<String> noms) {
        return new HashSet<>(marqueRepository.findByNomIn(noms));
    }

    public UtilisateurService(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }
    public Utilisateur enregistrer(Utilisateur utilisateur) {
        return utilisateurRepository.save(utilisateur);
    }

    public void supprimer(Long id) {
        utilisateurRepository.deleteById(id);
    }
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé avec l'email : " + username));

        return utilisateur;
    }
    public List<Parc> getParcsByNoms(List<String> noms) {
        return parcRepository.findByNomIn(noms);
    }
    public List<UtilisateurDTO> getAllUtilisateurs() {
        return utilisateurRepository.findAll().stream().map(utilisateur -> {
            UtilisateurDTO dto = new UtilisateurDTO();
            dto.setId(utilisateur.getId());
            dto.setNom(utilisateur.getNom());
            dto.setPrenom(utilisateur.getPrenom());
            dto.setEmail(utilisateur.getEmail());
            dto.setRole(utilisateur.getRole());
            dto.setParcNom(utilisateur.getParc() != null ? utilisateur.getParc().getNom() : null);
            dto.setParcsAccessibles(utilisateur.getParcsAcces().stream().map(Parc::getNom).toList());
            dto.setMarquesAccessibles(
                    utilisateur.getMarquesAccessibles().stream()
                            .map(marque -> marque.getNom())
                            .collect(Collectors.toSet())
            );            return dto;
        }).toList();
    }

}
