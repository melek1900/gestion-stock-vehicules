package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.model.Photo;
import com.melek.vehicule.gestion_stock_vehicules.repository.ParcRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.PhotoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
public class PhotoController {
    @Autowired
    private PhotoRepository photoRepository;


    @GetMapping("/api/photos-by-name/{fileName}")
    public ResponseEntity<byte[]> getPhotoByFileName(@PathVariable String fileName) {
        Optional<Photo> optionalPhoto = photoRepository.findByFileName(fileName);
        if (optionalPhoto.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Photo photo = optionalPhoto.get();

        HttpHeaders headers = new HttpHeaders();

        // 🔍 Déduire le type MIME selon l'extension
        String extension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        MediaType mediaType;
        switch (extension) {
            case "png":
                mediaType = MediaType.IMAGE_PNG;
                break;
            case "jpg":
            case "jpeg":
                mediaType = MediaType.IMAGE_JPEG;
                break;
            case "gif":
                mediaType = MediaType.IMAGE_GIF;
                break;
            default:
                mediaType = MediaType.APPLICATION_OCTET_STREAM;
                break;
        }

        headers.setContentType(mediaType);
        return new ResponseEntity<>(photo.getData(), headers, HttpStatus.OK);
    }

    @GetMapping("/api/{id}")
    public ResponseEntity<byte[]> getPhoto(@PathVariable Long id) {
        return photoRepository.findById(id)
                .map(photo -> ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline;filename=" + photo.getFileName())
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(photo.getData()))
                .orElse(ResponseEntity.notFound().build());
    }
}
