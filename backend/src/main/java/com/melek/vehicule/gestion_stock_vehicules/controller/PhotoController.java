package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.model.Photo;
import com.melek.vehicule.gestion_stock_vehicules.repository.PhotoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/photos")
public class PhotoController {

    @Autowired
    private PhotoRepository photoRepository;

    /**
     * ✅ Récupérer une photo par ID (URL : /photos/{id})
     */
    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getPhoto(@PathVariable Long id) {
        return photoRepository.findById(id)
                .map(photo -> {
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentDisposition(ContentDisposition.inline().filename(photo.getFileName()).build());
                    headers.setContentType(resolveMediaType(photo.getFileName()));
                    return new ResponseEntity<>(photo.getData(), headers, HttpStatus.OK);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * ✅ Récupérer une photo par nom de fichier (URL : /photos/by-name/{fileName})
     */
    @GetMapping("/by-name/{fileName}")
    public ResponseEntity<byte[]> getPhotoByFileName(@PathVariable String fileName) {
        Optional<Photo> optionalPhoto = photoRepository.findByFileName(fileName);
        if (optionalPhoto.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Photo photo = optionalPhoto.get();

        // Déterminer le type MIME selon l'extension
        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();


        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(resolveMediaType(photo.getFileName()));
        headers.setContentDisposition(ContentDisposition.inline().filename(photo.getFileName()).build());

        return new ResponseEntity<>(photo.getData(), headers, HttpStatus.OK);
    }
    private MediaType resolveMediaType(String fileName) {
        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        return switch (extension) {
            case "png" -> MediaType.IMAGE_PNG;
            case "jpg", "jpeg" -> MediaType.IMAGE_JPEG;
            case "gif" -> MediaType.IMAGE_GIF;
            case "bmp" -> MediaType.valueOf("image/bmp");
            case "webp" -> MediaType.valueOf("image/webp");
            default -> MediaType.APPLICATION_OCTET_STREAM;
        };
    }
}
