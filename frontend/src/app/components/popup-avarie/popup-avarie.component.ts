import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, Inject, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-popup-avarie',
  templateUrl: './popup-avarie.component.html',
  styleUrls: ['./popup-avarie.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    MatInputModule,
    MatDialogModule
  ],
})
export class PopupAvarieComponent {
  avaries: any[] = [];
  imageAgrandie: string | null = null;
  isCameraOpen = false;
  activeIndex: number | null = null;
  isUsingFrontCamera = false;
  commentaireExpert: string = '';
  peutReparer: boolean = false;
  photoPreviews: { [key: number]: string[] } = {};
  photos: File[][] = [];
  isLoadingPhotos = false;
  isExpert: boolean = false;
  form: FormGroup;
  isReadonly = true;
  photosExistantesASupprimer: { [index: number]: string[] } = {};

  @ViewChild('videoElement') videoElement!: ElementRef;
  @ViewChildren('fileInput') fileInputs!: QueryList<ElementRef>;

  constructor(
    public dialogRef: MatDialogRef<PopupAvarieComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder
  ) {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded: any = jwtDecode(token);
      this.isExpert = decoded.role === 'ROLE_EXPERT';
    }
  
    this.form = this.fb.group({
      avaries: this.fb.array([]),
      commentaireExpert: ['']  // Ajout du champ expert dans le formGroup si nécessaire
    });
  
    this.avaries = data?.vehicule?.avaries || [];
  
    // ✅ Initialisation des photos
    this.photos = this.avaries.map(() => []);
    this.photoPreviews = {};
  
    // ✅ Chargement des avaries et photos existantes
    this.avaries.forEach((av: any, index: number) => {
      this.ajouterAvarieExistante(av);
  
      // 🟢 Si photoUrls présentes, les ajouter dans photoPreviews comme dans popup-vehicule
      this.photoPreviews[index] = av.photoUrls || [];
    });
  }
  
  ajouterAvarieExistante(avarie: any) {
    const avariesFormArray = this.form.get('avaries') as FormArray;
    const avarieForm = this.fb.group({
      id: [avarie.id || null],
      type: [{ value: avarie.type, disabled: this.isReadonly }],
      commentaire: [{ value: avarie.commentaire, disabled: this.isReadonly }],
      photos: [avarie.photoUrls || []]
    });
    avariesFormArray.push(avarieForm);
  }
  get avariesForm(): FormArray {
    return this.form.get('avaries') as FormArray;
  }
  supprimerPhotoExistante(avarieIndex: number, photoIndex: number) {
    const removedPhoto = this.photoPreviews[avarieIndex][photoIndex];
  
    // Ajoute à la liste des photos à supprimer
    if (!this.photosExistantesASupprimer[avarieIndex]) {
      this.photosExistantesASupprimer[avarieIndex] = [];
    }
    this.photosExistantesASupprimer[avarieIndex].push(removedPhoto);
  
    // Supprime visuellement
    this.photoPreviews[avarieIndex].splice(photoIndex, 1);
  }
  getFormControl(group: any, controlName: string) {
    return group.get(controlName);
  }

  ouvrirImage(photoUrl: string) {
    this.imageAgrandie = photoUrl;
  }
  
  verifierFormulaire() {
    const commentaireCtrl = this.form.get('commentaireExpert');
    this.peutReparer = !!commentaireCtrl?.value?.trim();
  }
  
  

  fermerImage() {
    this.imageAgrandie = null;
  }
  toggleCamera(index: number) {
    this.isUsingFrontCamera = !this.isUsingFrontCamera;
    console.log("🔄 Caméra changée");
  
    // Optionnel : relancer la caméra avec la nouvelle contrainte
    const constraints = {
      video: {
        facingMode: this.isUsingFrontCamera ? 'user' : 'environment'
      }
    };
  
    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        const video = this.videoElement?.nativeElement;
        if (video) {
          video.srcObject = stream;
          video.play();
        }
      })
      .catch(err => console.error("🚨 Erreur d'accès à la caméra :", err));
  }
  /** ✅ Ouvrir la caméra */
  openCamera(index: number) {
    this.isCameraOpen = true;
    this.activeIndex = index;
    setTimeout(() => {
      const video = this.videoElement?.nativeElement;
      if (video) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then((stream) => {
            video.srcObject = stream;
            video.play();
          })
          .catch((err) => console.error("🚨 Erreur d'accès à la caméra :", err));
      }
    }, 100);
  }

  /** ✅ Capturer une photo depuis la caméra */
  capturePhoto(avarieIndex: number) {
    if (!this.videoElement || !this.videoElement.nativeElement) {
      console.error("🚨 Erreur : Élement vidéo non trouvé !");
      return;
    }
  
    // ✅ 1️⃣ Récupérer la vidéo
    const video = this.videoElement.nativeElement as HTMLVideoElement;
  
    // ✅ 2️⃣ Créer un canvas temporaire pour capturer l'image
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;  // Utiliser la taille de la vidéo
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
  
    if (!context) {
      console.error("🚨 Erreur : Impossible d'obtenir le contexte 2D du canvas !");
      return;
    }
  
    // ✅ 3️⃣ Dessiner la vidéo sur le canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
  
    // ✅ 4️⃣ Convertir l'image en base64
    const imageUrl = canvas.toDataURL("image/png");
  
    // ✅ 5️⃣ Ajouter l'image capturée à `photoPreviews`
    if (!this.photoPreviews[avarieIndex]) {
      this.photoPreviews[avarieIndex] = [];
    }
    this.photoPreviews[avarieIndex].push(imageUrl);
  
    console.log("📸 Photo capturée et ajoutée à l'aperçu pour l’avarie", avarieIndex);
  
    // ✅ 6️⃣ Fermer la caméra après capture
    this.closeCamera();
  }
  /** ✅ Fermer la caméra */
  closeCamera() {
    this.isCameraOpen = false;
    this.activeIndex = null;
    const video = this.videoElement?.nativeElement;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  }

  /** ✅ Ajouter une photo depuis la galerie */
  ajouterPhoto(event: Event, avarieIndex: number) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files: File[] = Array.from(input.files);
    files.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          this.photoPreviews[avarieIndex].push(result);
        }
      };
      reader.readAsDataURL(file);

      this.photos[avarieIndex].push(file);
    });
  }

  /** ✅ Supprimer une photo */
  supprimerPhoto(avarieIndex: number, photoIndex: number) {
    this.photoPreviews[avarieIndex].splice(photoIndex, 1);
    this.photos[avarieIndex].splice(photoIndex, 1);
  }

  /** ✅ Sauvegarder les avaries */
  sauvegarder() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    const formData = new FormData();
    formData.append('avarie', JSON.stringify(this.avaries));

    this.photos.forEach((photoList, i) => {
      photoList.forEach((photo, j) => {
        formData.append(`photos_${i}_${j}`, photo);
      });
    });

    this.http.put(`http://localhost:8080/api/vehicules/${this.data.vehicule.numeroChassis}/avaries`, formData, { headers }).subscribe({
      next: () => {
        this.snackBar.open('✅ Avarie mise à jour avec succès', 'Fermer', { duration: 3000 });
        this.dialogRef.close({ action: 'update', data: this.avaries });
      },
      error: () => {
        this.snackBar.open('❌ Erreur lors de la mise à jour', 'Fermer', { duration: 3000 });
      }
    });
  }

  reparerVehicule() {
    if (!this.peutReparer) return;
  
    const commentaire = this.form.get('commentaireExpert')?.value || '';
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });
  
    const body = { commentaire };
  
    this.http.patch(
      `http://localhost:8080/api/vehicules/${this.data.vehicule.numeroChassis}/reparer`,
      body,
      { headers }
    ).subscribe({
      next: () => {
        this.snackBar.open('✅ Véhicule réparé avec succès', 'Fermer', { duration: 3000 });
        this.dialogRef.close({ action: 'reparer' });
      },
      error: () => {
        this.snackBar.open('❌ Erreur lors de la réparation', 'Fermer', { duration: 3000 });
      }
    });
  }
  
}

