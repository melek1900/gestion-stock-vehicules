package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.melek.vehicule.gestion_stock_vehicules.dto.*;
import com.melek.vehicule.gestion_stock_vehicules.model.*;
import com.melek.vehicule.gestion_stock_vehicules.repository.ParcRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.UtilisateurRepository;
import com.melek.vehicule.gestion_stock_vehicules.service.AvarieService;
import com.melek.vehicule.gestion_stock_vehicules.service.ExcelService;
import com.melek.vehicule.gestion_stock_vehicules.service.VehiculeService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.melek.vehicule.gestion_stock_vehicules.repository.VehiculeRepository;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/vehicules")
public class VehiculeController {

    private final VehiculeService vehiculeService;
    private final ObjectMapper objectMapper;
    private final ExcelService excelService;
    private final AvarieService avarieService;

    @Autowired
    private VehiculeRepository vehiculeRepository;
    @Autowired
    private ParcRepository parcRepository;
    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Autowired
    public VehiculeController(VehiculeService vehiculeService, ObjectMapper objectMapper, ExcelService excelService, AvarieService avarieService) {
        this.vehiculeService = vehiculeService;
        this.objectMapper = objectMapper;
        this.excelService = excelService;
        this.avarieService = avarieService;

    }
    @PostMapping(value = "/{vehiculeId}/avaries/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> ajouterAvarieAvecPhotos(
            @PathVariable Long vehiculeId,
            @RequestPart("avarie") String avarieJson,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos
    ) {
        System.out.println("📨 Reçu POST /vehicules/" + vehiculeId + "/avaries/photos");
        System.out.println("🔍 JSON Avarie = " + avarieJson);
        System.out.println("📸 Nombre de photos = " + (photos != null ? photos.size() : 0));
        try {
            Avarie avarie = objectMapper.readValue(avarieJson, Avarie.class);
            Avarie saved = vehiculeService.ajouterAvarieEtPhotos(vehiculeId, avarie, photos);
            return ResponseEntity.ok(new AvarieDTO(saved));
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Erreur : " + e.getMessage());
        }
    }
    @GetMapping("/parc-nom/{nom}")
    public ResponseEntity<List<Vehicule>> getVehiculesByParcNom(@PathVariable String nom) {
        List<Vehicule> vehicules = vehiculeRepository.findBySousParc_Parc_NomIgnoreCase(nom);
        return ResponseEntity.ok(vehicules);
    }

    @PatchMapping("/{numeroChassis}/transfert-carrosserie")
    public ResponseEntity<Map<String, Boolean>> transfertCarrosserie(
            @PathVariable String numeroChassis,
            @RequestBody Map<String, Long> body) {
        Long sousParcId = body.get("sousParcId");
        boolean ordreCloture = vehiculeService.transfertVersCarrosserie(numeroChassis, sousParcId);

        Map<String, Boolean> response = new HashMap<>();
        response.put("ordreCloture", ordreCloture);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/statistiques/par-parc")
    public List<Map<String, Object>> countVehiculesParParc() {
        return vehiculeRepository.countVehiculesGroupedByParc();
    }
    @GetMapping("/statistiques/par-marque")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATEUR')")
    public ResponseEntity<List<StatistiqueParMarqueDTO>> getStatsParMarque() {
        return ResponseEntity.ok(vehiculeRepository.getStatistiquesParMarque());
    }
    @GetMapping("/statistiques/stock-parc-par-marque")
    @PreAuthorize("hasAuthority('ROLE_ADMINISTRATEUR')")
    public ResponseEntity<List<StatistiqueParcParMarqueDTO>> getStockParcParMarque() {
        List<Object[]> rawResults = vehiculeRepository.getStockParcParMarque();
        List<StatistiqueParcParMarqueDTO> result = rawResults.stream()
                .map(obj -> new StatistiqueParcParMarqueDTO(
                        (String) obj[0],
                        (String) obj[1],
                        (Long) obj[2]
                )).toList();
        return ResponseEntity.ok(result);
    }
    @GetMapping("/statistiques/par-statut")
    public ResponseEntity<Map<String, Long>> getStatsParStatut() {
        return ResponseEntity.ok(vehiculeService.getNombreVehiculesParStatut());
    }

    // ✅ Importation des véhicules depuis un fichier Excel
    @PostMapping("/import-excel")
    public ResponseEntity<Map<String, String>> importVehicules(@RequestParam("file") MultipartFile file) {
        try {
            ImportResult result = excelService.lireVehiculesDepuisExcel(file);

            int ajoutes = result.getVehiculesAjoutes().size();
            int ignores = result.getNombreVehiculesIgnores();

            if (ajoutes > 0) {
                vehiculeRepository.saveAll(result.getVehiculesAjoutes());
            }

            Map<String, String> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "📥 Importation terminée : " + ajoutes + " ajoutés, " + ignores + " ignorés (déjà existants).");
            response.put("ajoutes", String.valueOf(ajoutes));
            response.put("ignores", String.valueOf(ignores));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("status", "error");
            errorResponse.put("message", "❌ Erreur lors de l'importation du fichier Excel.");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }



    // ✅ Récupérer tous les véhicules du parc "MEGRINE"
    @GetMapping("/megrine")
    public ResponseEntity<List<VehiculeDTO>> getVehiculesMegrine() {
        List<VehiculeDTO> vehicules = vehiculeService.getVehiculesByParc("MEGRINE");
        return ResponseEntity.ok(vehicules);
    }
    @GetMapping("/parcs")
    public ResponseEntity<List<Vehicule>> getVehiculesByParcs(@RequestParam("ids") List<Long> ids) {
        List<Vehicule> vehicules = vehiculeService.getVehiculesByParcs(ids);
        return ResponseEntity.ok(vehicules);
    }

    // ✅ Ajouter un véhicule avec avaries et photos
    @PostMapping(consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<Vehicule> createVehicule(
            @RequestPart("vehicule") String vehiculeJson,
            @RequestPart(value = "avaries", required = false) String avariesJson,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos) {

        try {
            Vehicule vehicule = objectMapper.readValue(vehiculeJson, Vehicule.class);
            List<Avarie> avaries = (avariesJson != null && !avariesJson.isEmpty()) ?
                    List.of(objectMapper.readValue(avariesJson, Avarie[].class)) : null;

            Vehicule createdVehicule = vehiculeService.createVehicule(vehicule, avaries, photos);
            return new ResponseEntity<>(createdVehicule, HttpStatus.CREATED);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    // ✅ Modifier un véhicule existant (mise à jour)
    @PutMapping("/{numeroChassis}")
    public ResponseEntity<?> updateVehicule(@PathVariable String numeroChassis,
                                            @Valid @RequestBody VehiculeDTO vehiculeDTO,
                                            BindingResult result) {
        if (result.hasErrors()){
            return ResponseEntity.badRequest().body(result.getAllErrors());
        }

        if (vehiculeDTO.getParcId() == null) {
            System.err.println("🚨 ERREUR: Parc non défini dans la requête !");
            return ResponseEntity.badRequest().body("Parc non défini !");
        }

        Vehicule vehicule = vehiculeService.updateVehiculeFromDTO(numeroChassis, vehiculeDTO);
        return ResponseEntity.ok(new VehiculeDTO(vehicule));
    }


    // ✅ Ajouter une avarie à un véhicule
    @PostMapping("/{id}/avaries")
    public ResponseEntity<Avarie> ajouterAvarie(@PathVariable Long id, @RequestBody Avarie avarie) {
        Avarie nouvelleAvarie = vehiculeService.ajouterAvarie(id, avarie);
        return ResponseEntity.ok(nouvelleAvarie);
    }

    // ✅ Ajouter une photo à une avarie
    @PostMapping(value = "/avaries/{id}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Photo> ajouterPhotos(@PathVariable Long id, @RequestParam("photo") MultipartFile file) {
        Photo nouvellePhoto = vehiculeService.ajouterPhotos(id, file);
        return ResponseEntity.ok(nouvellePhoto);
    }
    @PostMapping(value = "/reception", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<?> receptionnerVehicule(
            @RequestPart("numeroChassis") String numeroChassis,
            @RequestPart("parcId") String parcIdString,
            @RequestParam(value = "avarie", required = false) String avarieJson,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos) {

        Long parcId = Long.parseLong(parcIdString);

        System.out.println("📥 Requête reçue pour réception : numéroChassis=" + numeroChassis + ", parcId=" + parcId);

        if (parcId == null) {
            return ResponseEntity.badRequest().body("🚨 parcId est requis !");
        }

        try {
            Vehicule vehicule = vehiculeService.receptionnerVehicule(numeroChassis, parcId, avarieJson, photos);
            VehiculeDTO dto = new VehiculeDTO(vehicule);
            return ResponseEntity.ok(dto);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("⛔ " + e.getMessage());
        } catch (Exception e) {
            // Autre exception non prévue
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("❌ Erreur interne lors de la réception du véhicule.");
        }
    }
    @GetMapping("/vehicules/{numeroChassis}/avaries")
    public ResponseEntity<List<AvarieDTO>> getAvariesParVehicule(@PathVariable String numeroChassis) {
        Vehicule vehicule = vehiculeRepository.findByNumeroChassis(numeroChassis)
                .orElseThrow(() -> new EntityNotFoundException("🚨 Véhicule non trouvé"));

        List<AvarieDTO> avariesDTO = vehicule.getAvaries().stream()
                .map(AvarieDTO::new)
                .toList();

        return ResponseEntity.ok(avariesDTO);
    }
    @PostMapping(value = "/{numeroChassis}/avarie", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> creerAvariePourVehicule(
            @PathVariable String numeroChassis,
            @RequestPart("avarie") String avarieJson,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos) {

        try {
            Vehicule vehicule = vehiculeService.creerAvarie(numeroChassis, avarieJson, photos);

            // 🔁 Retourner les avaries à jour au format DTO (avec URLs des photos, statuts, etc.)
            List<AvarieDTO> avarieDTOs = vehicule.getAvaries().stream()
                    .map(AvarieDTO::new)
                    .toList();

            return ResponseEntity.ok(avarieDTOs);

        } catch (EntityNotFoundException | IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("⛔ " + e.getMessage());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Erreur interne lors de la création de l'avarie.");
        }
    }
    @GetMapping("/parc/transfert")
    public ResponseEntity<List<VehiculeDTO>> getVehiculesTransfert() {
        Optional<Parc> parcTransfert = parcRepository.findByNom("TRANSFERT");

        if (parcTransfert.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<Vehicule> vehicules = vehiculeRepository.findByParcId(parcTransfert.get().getId());
        List<VehiculeDTO> dtoList = vehicules.stream().map(VehiculeDTO::new).toList();

        return ResponseEntity.ok(dtoList);
    }
    @PatchMapping("/avaries/{id}/cloturer")
    @PreAuthorize("hasAuthority('ROLE_EXPERT')") // ou pas, selon sécurité
    public ResponseEntity<?> cloturerAvarie(@PathVariable Long id) {
        try {
            Avarie avarie = avarieService.cloturerAvarie(id); // à créer dans ton service
            return ResponseEntity.ok(new AvarieDTO(avarie));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
    @PostMapping(value = "/{numeroChassis}/avaries", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<List<AvarieDTO>> signalerAvarie(
            @PathVariable String numeroChassis,
            @RequestPart("avarie") String avarieJson,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos) {

        System.out.println("📡 Avarie reçue : " + avarieJson);
        System.out.println("📷 Photos reçues : " + (photos != null ? photos.size() : 0));

        Vehicule vehicule = vehiculeService.signalerAvarie(numeroChassis, avarieJson, photos);

        // Retourner la liste mise à jour des avaries (DTO)
        List<AvarieDTO> dtoList = vehicule.getAvaries().stream().map(AvarieDTO::new).toList();
        return ResponseEntity.ok(dtoList);
    }
    @PatchMapping("/{numeroChassis}/reparer")
    //@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_GESTIONNAIRE_STOCK')")
    public ResponseEntity<?> reparerVehiculeAvecCommentaire(
            @PathVariable String numeroChassis,
            @RequestBody Map<String, String> body
    ) {
        // ✅ Ajoute ce log ici
        System.out.println("🛠 Appel reçu dans le contrôleur PATCH /reparer avec utilisateur : " +
                SecurityContextHolder.getContext().getAuthentication().getName());

        String commentaireExpert = body.get("commentaire");
        if (commentaireExpert == null || commentaireExpert.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Commentaire de l'expert requis");
        }

        Vehicule vehicule = vehiculeService.reparerVehicule(numeroChassis);
        return ResponseEntity.ok().body(Map.of("message", "Véhicule réparé avec commentaire: " + commentaireExpert));
    }




    // ✅ Supprimer un véhicule
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicule(@PathVariable Long id) {
        vehiculeService.deleteVehicule(id);
        return ResponseEntity.noContent().build(); // ✅ 204 No Content
    }

    @GetMapping
    public ResponseEntity<List<VehiculeDTO>> getVehiculesParUtilisateurConnecte(Authentication authentication) {
        // ✅ Récupération de l'utilisateur connecté
        String email = authentication.getName();
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // ✅ Récupération des IDs des parcs accessibles
        List<Long> parcsAccessiblesIds = utilisateur.getParcsAcces().stream()
                .map(Parc::getId)
                .toList();

        // ✅ Récupération des noms des marques accessibles
        Set<String> marquesAccessibles = utilisateur.getMarquesAccessibles().stream()
                .map(Marque::getNom)  // Marque est une entité, on récupère le nom
                .map(String::toUpperCase) // Normalisation pour comparaison
                .collect(Collectors.toSet());

        // ✅ Appel du service pour filtrer les véhicules
        List<VehiculeDTO> vehiculesFiltres = vehiculeService.getVehiculesFiltres(parcsAccessiblesIds, marquesAccessibles);

        return ResponseEntity.ok(vehiculesFiltres);
    }




    // ✅ Récupérer un véhicule par ID
    @GetMapping("/{id}")
    public ResponseEntity<VehiculeDTO> getVehiculeById(@PathVariable Long id) {
        Vehicule vehicule = vehiculeService.getVehiculeById(id);
        return ResponseEntity.ok(new VehiculeDTO(vehicule));
    }
    // ✅ Réception manuelle des véhicules

    @GetMapping("/by-statut")
    public ResponseEntity<List<VehiculeDTO>> getVehiculesByStatut(@RequestParam(required = false) StatutVehicule statut) {
        List<Vehicule> vehicules;

        if (statut != null) {
            vehicules = vehiculeRepository.findByStatut(statut);
        } else {
            vehicules = vehiculeRepository.findAll();
        }

        List<VehiculeDTO> vehiculeDTOs = vehicules.stream()
                .map(VehiculeDTO::new)
                .toList();

        return ResponseEntity.ok(vehiculeDTOs);
    }
    @GetMapping("/avec-avaries")
    public ResponseEntity<List<VehiculeDTO>> getVehiculesAvecAvaries() {
        List<Vehicule> vehicules = vehiculeService.getVehiculesAvecAvaries();
        List<VehiculeDTO> dtos = vehicules.stream()
                .map(VehiculeDTO::new)
                .toList();
        return ResponseEntity.ok(dtos);
    }
    @GetMapping("/chassis/{numeroChassis}")
    public ResponseEntity<VehiculeDTO> getVehiculeByNumeroChassis(@PathVariable String numeroChassis) {
        Vehicule vehicule = vehiculeService.findByNumeroChassis(numeroChassis);
        if (vehicule == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new VehiculeDTO(vehicule));
    }
}
