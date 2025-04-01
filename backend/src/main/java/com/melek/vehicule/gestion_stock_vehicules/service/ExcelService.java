package com.melek.vehicule.gestion_stock_vehicules.service;

import com.melek.vehicule.gestion_stock_vehicules.dto.ImportResult;
import com.melek.vehicule.gestion_stock_vehicules.model.*;
import com.melek.vehicule.gestion_stock_vehicules.repository.CompteurImportRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.ParcRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.StockRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.VehiculeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.apache.poi.openxml4j.exceptions.OLE2NotOfficeXmlFileException;
import org.apache.poi.poifs.filesystem.OfficeXmlFileException;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;

@Service
public class ExcelService {
    private static final Logger log = LoggerFactory.getLogger(ExcelService.class);

    private final VehiculeRepository vehiculeRepository;
    private final ParcRepository parcRepository;
    private final StockRepository stockRepository;
    private final CompteurImportRepository compteurImportRepository;

    public ExcelService(VehiculeRepository vehiculeRepository, ParcRepository parcRepository, StockRepository stockRepository,CompteurImportRepository compteurImportRepository) {
        this.vehiculeRepository = vehiculeRepository;
        this.parcRepository = parcRepository;
        this.stockRepository = stockRepository;
        this.compteurImportRepository = compteurImportRepository;
    }

    public ImportResult lireVehiculesDepuisExcel(MultipartFile file) throws Exception {
        List<Vehicule> vehiculesAjoutes = new ArrayList<>();
        int ignores = 0;

        try (InputStream is = file.getInputStream(); Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);

            List<String> numerosChassisExistants = vehiculeRepository.findAll()
                    .stream()
                    .map(Vehicule::getNumeroChassis)
                    .collect(Collectors.toList());

            for (Row row : sheet) {
                if (row.getRowNum() < 3) continue;

                String numeroChassis = getStringCellValue(row.getCell(1));
                if (numerosChassisExistants.contains(numeroChassis)) {
                    log.warn("Véhicule ignoré (déjà en base) : {}", numeroChassis);
                    ignores++;
                    continue;
                }

                Vehicule vehicule = new Vehicule();
                vehicule.setNumeroChassis(numeroChassis);
                vehicule.setProductionDate(getDateCellValue(row.getCell(0)));
                vehicule.setModele(getStringCellValue(row.getCell(2)));
                vehicule.setDescription(getStringCellValue(row.getCell(3)));
                vehicule.setEngine(getStringCellValue(row.getCell(4)));
                vehicule.setKeyCode(getStringCellValue(row.getCell(5)));
                vehicule.setCouleur(getStringCellValue(row.getCell(6)));
                vehicule.setPegCode(getStringCellValue(row.getCell(7)));
                vehicule.setShortColor(getStringCellValue(row.getCell(8)));
                vehicule.setShortDescription(getStringCellValue(row.getCell(9)));
                vehicule.setStatut(StatutVehicule.EN_ETAT);

                Parc parcAuport = parcRepository.findById(4L)
                        .orElseThrow(() -> new EntityNotFoundException("🚨 Parc AUPORT introuvable"));
                vehicule.setParc(parcAuport);

                vehiculesAjoutes.add(vehicule);
            }
        }

        vehiculeRepository.saveAll(vehiculesAjoutes);

        String annee = String.valueOf(LocalDate.now().getYear());
        CompteurImport compteur = compteurImportRepository.findByAnnee(annee)
                .orElseGet(() -> new CompteurImport(annee, 0));

        compteur.setCompteur(compteur.getCompteur() + 1);
        compteurImportRepository.save(compteur);

        String numeroImport = compteur.getNumeroComplet();
        System.out.println("📥 Numéro d'import généré : " + numeroImport);

        return new ImportResult(vehiculesAjoutes, ignores, numeroImport);
    }



    private String getStringCellValue(Cell cell) {
        return (cell != null) ? cell.getStringCellValue().trim() : "";
    }

    private Date getDateCellValue(Cell cell) {
        if (cell != null) {
            try {
                // ✅ Si la cellule est de type NUMERIC et formatée en DATE
                if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue();
                }
                // ✅ Si la cellule est de type STRING (ex: "2024-03-01")
                else if (cell.getCellType() == CellType.STRING) {
                    String dateStr = cell.getStringCellValue().trim();
                    System.out.println("📌 Lecture date brute: " + dateStr);

                    // ✅ Essaye différents formats possibles
                    SimpleDateFormat[] dateFormats = {
                            new SimpleDateFormat("yyyy-MM-dd"), // Format détecté dans la console
                            new SimpleDateFormat("dd/MM/yyyy"),
                            new SimpleDateFormat("MM/dd/yyyy")
                    };

                    for (SimpleDateFormat format : dateFormats) {
                        try {
                            return format.parse(dateStr);
                        } catch (ParseException ignored) { }
                    }
                }
            } catch (Exception e) {
                System.err.println("⚠ Erreur conversion date: " + cell);
            }
        }
        return null;
    }
}

