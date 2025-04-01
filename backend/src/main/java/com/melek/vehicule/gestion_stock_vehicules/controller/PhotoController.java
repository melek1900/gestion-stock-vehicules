package com.melek.vehicule.gestion_stock_vehicules.controller;

import com.melek.vehicule.gestion_stock_vehicules.model.Photo;
import com.melek.vehicule.gestion_stock_vehicules.repository.ParcRepository;
import com.melek.vehicule.gestion_stock_vehicules.repository.PhotoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PhotoController {
    @Autowired
    private PhotoRepository photoRepository;


    @GetMapping("/api/photos-by-name/{fileName}")
    public ResponseEntity<byte[]> getPhotoByFileName(@PathVariable String fileName) {
        Photo photo = photoRepository.findByFileName(fileName)
                .orElseThrow(() -> new RuntimeException("Photo introuvable par nom"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_JPEG); // ou .PNG selon le type
        return new ResponseEntity<>(photo.getData(), headers, HttpStatus.OK);
    }
}
