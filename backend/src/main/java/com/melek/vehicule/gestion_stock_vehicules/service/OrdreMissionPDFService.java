package com.melek.vehicule.gestion_stock_vehicules.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.*;
import com.melek.vehicule.gestion_stock_vehicules.model.OrdreMission;
import com.melek.vehicule.gestion_stock_vehicules.model.Vehicule;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class OrdreMissionPDFService {

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

        // ✅ Date de création (alignement strictement à gauche)
        String now = new SimpleDateFormat("dd/MM/yyyy HH:mm").format(new Date());
        Paragraph dateCreation = new Paragraph("Date de création : " + now,
                FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY));
        dateCreation.setAlignment(Element.ALIGN_LEFT);
        dateCreation.setIndentationLeft(40);
        dateCreation.setSpacingAfter(20);
        document.add(dateCreation);

        // ✅ Tableau Chauffeur
        document.add(new Paragraph("🚗 Informations Chauffeur", getSectionFont()));
        document.add(new Paragraph("\n"));

        PdfPTable chauffeurTable = new PdfPTable(5);
        chauffeurTable.setWidthPercentage(100);
        chauffeurTable.setWidths(new float[]{2, 2, 2, 2, 2});

        chauffeurTable.addCell(getHeaderCell("Nom"));
        chauffeurTable.addCell(getHeaderCell("Prénom"));
        chauffeurTable.addCell(getHeaderCell("CIN"));
        chauffeurTable.addCell(getHeaderCell("Délivré le"));
        chauffeurTable.addCell(getHeaderCell("Permis N°"));

        chauffeurTable.addCell(getCell(ordreMission.getChauffeur().getNom()));
        chauffeurTable.addCell(getCell(ordreMission.getChauffeur().getPrenom()));
        chauffeurTable.addCell(getCell(ordreMission.getChauffeur().getCIN()));
        chauffeurTable.addCell(getCell(new SimpleDateFormat("dd/MM/yyyy")
                .format(ordreMission.getChauffeur().getDateDelivrance())));
        chauffeurTable.addCell(getCell(String.valueOf(ordreMission.getChauffeur().getNumeroPermis())));

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
