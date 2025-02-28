import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgIf, NgFor } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

// 📌 Scanner QR Code (ZXing)
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/browser';

@Component({
  selector: 'app-enregistrer-vehicule',
  templateUrl: './enregistrer-vehicule.component.html',
  styleUrls: ['./enregistrer-vehicule.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatCardModule,
    MatSelectModule,
    NgIf,
    NgFor,
    ZXingScannerModule,
    MatIconModule
  ],
})
export class EnregistrerVehiculeComponent {
  @ViewChild('videoElement') videoElement!: ElementRef;
  form: FormGroup;
  typesAvaries = ['Rayure', 'Bosse', 'Pièce manquante', 'Autre'];
  
  // ✅ QR Code
  isScanning = false;
  qrResult: string = '';
  scannerFormats = [BarcodeFormat.QR_CODE];

  // ✅ Caméra
  isCameraOpen = false;
  activeIndex: number | null = null;
  avariePhotos: File[][] = [];  // ✅ Définir comme tableau de tableaux de fichiers
  isUsingFrontCamera = false; // ✅ Ajout d'une variable pour alterner les caméras
  photoPreviews: string[][] = [];  // ✅ Définir comme tableau de tableaux de chaînes

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      modele: ['', Validators.required],
      numeroChassis: ['', Validators.required],
      couleur: ['', Validators.required],
      dateArrivee: ['', Validators.required],
      provenance: ['', Validators.required],
      avaries: this.fb.array([]),
    });
  }

  /** ✅ Démarrer le scanner QR Code */
  startScanner() {
    this.isScanning = true;
  }

  /** ✅ Capture du résultat du QR Code */
  onCodeResult(resultString: string) {
    console.log('📸 QR Code détecté:', resultString);
    this.qrResult = resultString;
    this.form.controls['numeroChassis'].setValue(resultString);
    this.isScanning = false;
  }

  /** ✅ Fermer le scanner QR Code */
  stopScanner() {
    this.isScanning = false;
  }

  /** ✅ Gestion des avaries */
  get avaries(): FormArray {
    return this.form.get('avaries') as FormArray;
  }

  ajouterAvarie() {
    this.avaries.push(
      this.fb.group({
        type: ['', Validators.required],
        commentaire: [''],
      })
    );
  }

  supprimerAvarie(index: number) {
    this.avaries.removeAt(index);
    this.photoPreviews.splice(index, 1);
  }

  /** ✅ Ajouter une photo depuis les fichiers locaux */
  onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (file) {
      // ✅ Ajouter la photo sélectionnée à l'avarie correspondante
      if (!Array.isArray(this.avariePhotos[index])) {
        this.avariePhotos[index] = [];
      }
      this.avariePhotos[index].push(file);
  
      // ✅ Afficher l'aperçu de la photo
      if (!this.photoPreviews[index]) {
        this.photoPreviews[index] = [];
      }
      this.photoPreviews[index].push(URL.createObjectURL(file));
    }
  }
  

  /** ✅ Ouvrir la caméra */
  openCamera(index: number) {
    this.isCameraOpen = true;
    this.activeIndex = index;
  
    navigator.mediaDevices.getUserMedia({ video: { facingMode: this.isUsingFrontCamera ? "user" : "environment" } })
      .then((stream) => {
        const video = this.videoElement.nativeElement;
        video.srcObject = stream;
        video.play();
      })
      .catch((error) => {
        this.snackBar.open("Impossible d’accéder à la caméra", "Fermer", { duration: 3000 });
      });
  }

  capturePhoto(index: number) {
    const video = this.videoElement.nativeElement;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
  
        // ✅ Ajouter la photo capturée dans la liste des photos de l'avarie
        if (!Array.isArray(this.avariePhotos[index])) {
          this.avariePhotos[index] = [];
        }
        this.avariePhotos[index].push(file);
        
        // ✅ Afficher l'aperçu de la photo
        if (!this.photoPreviews[index]) {
          this.photoPreviews[index] = [];
        }
        this.photoPreviews[index].push(URL.createObjectURL(file));
  
        // ✅ Fermer la caméra après capture
        this.isCameraOpen = false;
        (video.srcObject as MediaStream)?.getTracks().forEach(track => track.stop());
      }
    }, 'image/jpeg');
  }
  

  closeCamera() {
    this.isCameraOpen = false;
    const video = this.videoElement.nativeElement;
    (video.srcObject as MediaStream)?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
  }

  toggleCamera(index: number) {
    this.isUsingFrontCamera = !this.isUsingFrontCamera;
    this.openCamera(index);
  }
  /** ✅ Capture une photo et ferme la caméra */
  
  

  /** ✅ Supprimer une photo */
  removePhoto(avarieIndex: number, photoIndex: number): void {
    if (this.photoPreviews[avarieIndex] && this.photoPreviews[avarieIndex][photoIndex]) {
      this.photoPreviews[avarieIndex].splice(photoIndex, 1);
    }
  
    if (this.avariePhotos[avarieIndex] && this.avariePhotos[avarieIndex][photoIndex]) {
      this.avariePhotos[avarieIndex].splice(photoIndex, 1);
    }
  }

  enregistrerVehicule() {
    if (this.form.valid) {
      const formData = new FormData();
  
      // ✅ Données du véhicule
      formData.append('vehicule', new Blob([JSON.stringify(this.form.value)], { type: "application/json" }));
  
      // ✅ Ajouter les photos associées aux avaries
      this.avariePhotos.forEach((photos, index) => {
        if (photos && photos.length > 0) {
          photos.forEach((photo, photoIndex) => {
            formData.append(`photos_avarie_${index}`, photo, `avarie_${index}_photo_${photoIndex}.jpg`);
          });
        }
      });
  
      console.log("🚀 Données envoyées :", Array.from(formData.entries()));
  
      this.http.post('http://localhost:8080/api/vehicules', formData).subscribe({
        next: () => {
          this.snackBar.open('Véhicule enregistré avec succès !', 'Fermer', { duration: 3000 });
          this.router.navigate(['/vehicules']);
        },
        error: (error) => {
          console.error("🛑 Erreur d'envoi :", error);
          this.snackBar.open('Erreur lors de l’enregistrement', 'Fermer', { duration: 3000 });
        }
      });
    }
  }
}
