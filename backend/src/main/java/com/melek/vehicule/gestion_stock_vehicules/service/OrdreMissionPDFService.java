package com.melek.vehicule.gestion_stock_vehicules.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.*;
import com.melek.vehicule.gestion_stock_vehicules.model.MotifDeplacement;
import com.melek.vehicule.gestion_stock_vehicules.model.OrdreMission;
import com.melek.vehicule.gestion_stock_vehicules.model.Vehicule;
import com.melek.vehicule.gestion_stock_vehicules.repository.MotifDeplacementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.text.SimpleDateFormat;
import java.text.Normalizer;
import java.util.Date;
import java.util.List;

@Service
public class OrdreMissionPDFService {
    @Autowired
    private MotifDeplacementRepository motifDeplacementRepository;
    public byte[] generateOrdreMissionPDF(OrdreMission ordreMission) throws Exception {
        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
        Document document = new Document();
        PdfWriter writer = PdfWriter.getInstance(document, byteArrayOutputStream);
        document.open();

        // ✅ HEADER avec 3 logos
        PdfPTable headerTable = new PdfPTable(3);
        headerTable.setWidthPercentage(100);
        headerTable.setWidths(new float[]{1, 1, 1});

        try {
            Image img1 = Image.getInstance(getClass().getResource("/static/images/logochevrolet.jpg"));
            Image img2 = Image.getInstance(getClass().getResource("/static/images/GM1.jpg"));
            Image img3 = Image.getInstance(getClass().getResource("/static/images/ISUZU1.png"));

            float width = 120f, height = 60f;
            img1.scaleToFit(width, height);
            img2.scaleToFit(width, height);
            img3.scaleToFit(width, height);

            headerTable.addCell(getImageCell(img1, height));
            headerTable.addCell(getImageCell(img2, height));
            headerTable.addCell(getImageCell(img3, height));

            document.add(headerTable);
        } catch (Exception e) {
            System.err.println("Erreur chargement images header: " + e.getMessage());
        }

        // ✅ Titre
        Paragraph titre = new Paragraph("ORDRE DE MISSION", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16));
        titre.setAlignment(Element.ALIGN_CENTER);
        titre.setSpacingBefore(20);
        titre.setSpacingAfter(40);
        document.add(titre);

        // ✅ Code-barres
        PdfContentByte cb = writer.getDirectContent();
        Barcode128 barcode = new Barcode128();
        barcode.setCode(ordreMission.getNumeroOrdre());
        barcode.setBarHeight(35f);
        barcode.setX(1.5f);
        barcode.setFont(null);

        Image barcodeImage = barcode.createImageWithBarcode(cb, null, null);
        barcodeImage.setAbsolutePosition(40, 640);
        document.add(barcodeImage);
        document.add(new Paragraph("\n"));

        // ✅ Numéro d'ordre
        Paragraph numeroOrdre = new Paragraph(ordreMission.getNumeroOrdre(),
                FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12));
        numeroOrdre.setIndentationLeft(40);
        numeroOrdre.setSpacingBefore(2);
        document.add(numeroOrdre);

        // ✅ ESPACE supplémentaire
        document.add(new Paragraph("\n"));

        // ✅ Date et Heure de départ
        // ✅ Conversion LocalDate + LocalTime vers java.util.Date
        LocalDateTime dateTimeDepart = LocalDateTime.of(ordreMission.getDateDepart(), ordreMission.getHeureDepart());
        Date dateHeureDepart = Date.from(dateTimeDepart.atZone(ZoneId.systemDefault()).toInstant());

        // ✅ Formatage en String
        String dateDepartStr = new SimpleDateFormat("dd/MM/yyyy").format(dateHeureDepart);
        String heureDepartStr = new SimpleDateFormat("HH:mm").format(dateHeureDepart);

        // ✅ Ajout au document
        Paragraph dateHeureDepartParagraph = new Paragraph(
                "Départ prévu le : " + dateDepartStr + " à " + heureDepartStr,
                FontFactory.getFont(FontFactory.HELVETICA, 11, Color.DARK_GRAY)
        );
        dateHeureDepartParagraph.setIndentationLeft(40);
        dateHeureDepartParagraph.setSpacingAfter(20);
        document.add(dateHeureDepartParagraph);

        document.add(new Paragraph("📍 Informations sur les parcs", getSectionFont()));
        document.add(new Paragraph("\n"));

        PdfPTable parcTable = new PdfPTable(2);
        parcTable.setWidthPercentage(100);
        parcTable.setWidths(new float[]{2, 2});

        parcTable.addCell(getHeaderCell("Parc Départ"));
        parcTable.addCell(getHeaderCell("Parc Arrivée"));

        parcTable.addCell(getCell(
                ordreMission.getParcDepart() != null ? ordreMission.getParcDepart().getNom() : "Non renseigné"));
        parcTable.addCell(getCell(
                ordreMission.getParcArrivee() != null ? ordreMission.getParcArrivee().getNom() : "Non renseigné"));

        document.add(parcTable);
        if (ordreMission.getParcArrivee() != null
                && "CARROSSERIE".equalsIgnoreCase(ordreMission.getParcArrivee().getNom())
                && ordreMission.getSousParc() != null) {

            document.add(new Paragraph("🅿️ Sous-parc de destination (CARROSSERIE)", getSectionFont()));
            document.add(new Paragraph("\n"));

            PdfPTable sousParcTable = new PdfPTable(1);
            sousParcTable.setWidthPercentage(100);
            sousParcTable.setSpacingBefore(10);

            sousParcTable.addCell(getHeaderCell("Nom du Sous-Parc"));
            sousParcTable.addCell(getCell(ordreMission.getSousParc().getNom()));

            document.add(sousParcTable);
            document.add(new Paragraph("\n"));
        }
        document.add(new Paragraph("\n"));
        // ✅ Tableau Chauffeur
        document.add(new Paragraph("🚗 Informations Chauffeurs", getSectionFont()));
        document.add(new Paragraph("\n"));

        PdfPTable chauffeurTable = new PdfPTable(5);
        chauffeurTable.setWidthPercentage(100);
        chauffeurTable.setWidths(new float[]{2, 2, 2, 2, 2});

        chauffeurTable.addCell(getHeaderCell("Nom"));
        chauffeurTable.addCell(getHeaderCell("Prénom"));
        chauffeurTable.addCell(getHeaderCell("CIN"));
        chauffeurTable.addCell(getHeaderCell("Délivré le"));
        chauffeurTable.addCell(getHeaderCell("Permis N°"));

        if (ordreMission.getChauffeurs() != null && !ordreMission.getChauffeurs().isEmpty()) {
            for (var chauffeur : ordreMission.getChauffeurs()) {
                chauffeurTable.addCell(getCell(chauffeur.getNom()));
                chauffeurTable.addCell(getCell(chauffeur.getPrenom()));
                chauffeurTable.addCell(getCell(chauffeur.getCIN()));
                chauffeurTable.addCell(getCell(new SimpleDateFormat("dd/MM/yyyy")
                        .format(chauffeur.getDateDelivrance())));
                chauffeurTable.addCell(getCell(String.valueOf(chauffeur.getNumeroPermis())));
            }
        } else {
            PdfPCell emptyCell = new PdfPCell(new Phrase("Aucun chauffeur attribué"));
            emptyCell.setColspan(5);
            emptyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            emptyCell.setPadding(10);
            chauffeurTable.addCell(emptyCell);
        }

        document.add(chauffeurTable);
        document.add(new Paragraph("\n"));

        // ✅ Véhicule de Transport
        document.add(new Paragraph("🚛 Véhicule de Transport", getSectionFont()));
        document.add(new Paragraph("\n"));

        PdfPTable transportTable = new PdfPTable(2);
        transportTable.setWidthPercentage(100);
        transportTable.setWidths(new float[]{2, 2});

        transportTable.addCell(getHeaderCell("Matricule"));
        transportTable.addCell(getHeaderCell("Type"));

        transportTable.addCell(getCell(ordreMission.getVehiculeTransport().getMatricule()));
        transportTable.addCell(getCell(ordreMission.getVehiculeTransport().getType()));

        document.add(transportTable);
        document.add(new Paragraph("\n"));

        // ✅ Véhicules Transférés
        document.add(new Paragraph("🚘 Liste des Véhicules Transférés", getSectionFont()));
        PdfPTable vehiculeTable = new PdfPTable(3);
        vehiculeTable.setWidthPercentage(100);
        vehiculeTable.setWidths(new float[]{2, 2, 2});
        vehiculeTable.setSpacingBefore(10);

        vehiculeTable.addCell(getHeaderCell("Modèle"));
        vehiculeTable.addCell(getHeaderCell("Numéro de Châssis"));
        vehiculeTable.addCell(getHeaderCell("Couleur"));

        for (Vehicule v : ordreMission.getVehicules()) {
            vehiculeTable.addCell(getCell(v.getShortDescription()));
            vehiculeTable.addCell(getCell(v.getNumeroChassis()));
            vehiculeTable.addCell(getCell(v.getShortColor()));
        }

        document.add(vehiculeTable);
        document.add(new Paragraph("\n\n"));
        // ✅ Motif de déplacement
        document.add(new Paragraph("📌 Motif de déplacement", getSectionFont()));
        document.add(new Paragraph("\n"));
        PdfPTable motifTable = new PdfPTable(2);
        motifTable.setWidthPercentage(60);
        motifTable.setHorizontalAlignment(Element.ALIGN_LEFT);
        motifTable.setWidths(new float[]{3, 1});

        List<MotifDeplacement> motifsPossibles = motifDeplacementRepository.findAll();
        String motifActuel = ordreMission.getMotifDeplacement() != null ? ordreMission.getMotifDeplacement().getLibelle() : "";

        for (MotifDeplacement motif : motifsPossibles) {
            PdfPCell libelleCell = new PdfPCell(new Phrase(motif.getLibelle(), FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11)));
            libelleCell.setPadding(6);
            motifTable.addCell(libelleCell);

            PdfPCell caseCochee = new PdfPCell(new Phrase(
                    matchMotif(motif.getLibelle(), motifActuel) ? "X" : " "
            ));
            caseCochee.setHorizontalAlignment(Element.ALIGN_CENTER);
            caseCochee.setVerticalAlignment(Element.ALIGN_MIDDLE);
            caseCochee.setPadding(6);
            motifTable.addCell(caseCochee);
        }

        document.add(motifTable);
        document.add(new Paragraph("\n"));


        // ✅ Cadre Signature
        PdfPTable signatureTable = new PdfPTable(1);
        signatureTable.setTotalWidth(200);
        signatureTable.setLockedWidth(true);
        signatureTable.setHorizontalAlignment(Element.ALIGN_RIGHT);

        PdfPCell signatureCell = new PdfPCell(new Phrase("Signature Responsable"));
        signatureCell.setFixedHeight(60);
        signatureCell.setBorder(Rectangle.BOX);
        signatureCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        signatureCell.setVerticalAlignment(Element.ALIGN_BOTTOM);
        signatureCell.setPaddingBottom(10);

        signatureTable.addCell(signatureCell);
        document.add(signatureTable);

        // ✅ Footer
        try {
            Image footer = Image.getInstance(getClass().getResource("/static/images/piedpage.jpg"));
            footer.scaleToFit(500, 100);
            footer.setAbsolutePosition((document.getPageSize().getWidth() - 500) / 2, 20);
            document.add(footer);
        } catch (Exception e) {
            System.err.println("Erreur footer : " + e.getMessage());
        }

        document.close();
        return byteArrayOutputStream.toByteArray();
    }

    // ✅ Méthodes utilitaires
    private PdfPCell getImageCell(Image img, float height) {
        PdfPCell cell = new PdfPCell(img, true);
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setFixedHeight(height);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        return cell;
    }
    private boolean matchMotif(String motifLibelle, String attendu) {
        if (motifLibelle == null || attendu == null) return false;
        return normalize(motifLibelle).equals(normalize(attendu));
    }

    private String normalize(String input) {
        return java.text.Normalizer.normalize(input, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "") // Supprime les accents
                .toLowerCase()
                .trim();
    }

    private PdfPCell getHeaderCell(String text) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.WHITE);
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(new Color(50, 50, 50));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(5);
        return cell;
    }

    private PdfPCell getCell(String text) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setPadding(5);
        return cell;
    }

    private Font getSectionFont() {
        return FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
    }
}
