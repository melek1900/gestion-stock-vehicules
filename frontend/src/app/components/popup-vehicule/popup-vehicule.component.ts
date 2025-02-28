import { Component, ElementRef, Inject, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { NgIf, NgFor } from '@angular/common';

interface Photo {
  id?: number;
  fileName: string;
}
interface Avarie {
  id?: number;
  type: string;
  commentaire: string;
  photos?: string[];
  newPhotos?: File[];
}
@Component({
  selector: 'app-popup-vehicule',
  templateUrl: './popup-vehicule.component.html',
  styleUrls: ['./popup-vehicule.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    NgIf,
    NgFor,
  ],
})
export class PopupVehiculeComponent {

  form: FormGroup;
  typesAvaries = ['Rayure', 'Bosse', 'Pièce manquante', 'Autre'];
  isModification: boolean = false;

  photosPreviews: { [key: number]: string[] } = {}; // Aperçu des photos
  deletedPhotoIds: number[] = []; // 🔥 Garde en mémoire les photos supprimées
  newPhotos: File[] = []; // ✅ Initialisation de newPhotos


  @ViewChildren('fileInput') fileInputs!: QueryList<ElementRef>;
  @ViewChildren('videoElement') videoElements!: QueryList<ElementRef>;

  isCameraOpen = false;
  activeIndex: number | null = null;


  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PopupVehiculeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      id: [data?.vehicule?.id || null],
      modele: [''],
      numeroChassis: [''],
      couleur: [''],
      dateArrivee: [''],
      provenance: [''],
      avaries: this.fb.array([]),
    });

    if (data?.vehicule) {
      this.isModification = true;
      this.form.patchValue(data.vehicule);

      if (data.vehicule.avaries) {
        data.vehicule.avaries.forEach((avarie: any, index: number) => {
          const avarieGroup = this.fb.group({
            id: [avarie.id || null], // ✅ Conserve l'ID existant
            type: [avarie.type],
            commentaire: [avarie.commentaire],
            photos: [[]],
          });

          this.avaries.push(avarieGroup);
          this.photosPreviews[index] = avarie.photos || [];
        });
      }
    }
  }

  ajouterAvarie() {
    this.avaries.push(this.fb.group({ id: null, type: '', commentaire: '', photos: [[]] }));
  }

  supprimerAvarie(index: number) {
    this.avaries.removeAt(index);
    delete this.photosPreviews[index];
  }

  triggerFileInput(index: number) {
    const fileInput = this.fileInputs.toArray()[index]?.nativeElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileChange(event: any, avarieIndex: number) {
    const files: FileList = event.target.files;
    
    if (files && files.length > 0) {
        if (!this.photosPreviews[avarieIndex]) {
            this.photosPreviews[avarieIndex] = [];
        }

        Array.from(files).forEach((file) => {
            if (file instanceof File) {  // ✅ Vérifie bien que c'est un fichier
                this.photosPreviews[avarieIndex].push(URL.createObjectURL(file));  // Stocke en tant qu'URL temporaire
                this.newPhotos.push(file); // ✅ Ajoute le fichier pour l'envoi au backend
            }
        });
    }
}

  removePhoto(avarieIndex: number, photoIndex: number) {
    if (this.photosPreviews[avarieIndex] && this.photosPreviews[avarieIndex][photoIndex]) {
        const photoUrl = this.photosPreviews[avarieIndex][photoIndex];

        // ✅ Vérifier si la photo a un ID (si elle est déjà en base)
        const photo = this.data.vehicule.avaries[avarieIndex]?.photos?.find((p: any) => p.fileName === photoUrl);
        if (photo?.id) {
            this.deletedPhotoIds.push(photo.id); // ✅ Ajouter à la liste des photos supprimées
        }

        this.photosPreviews[avarieIndex].splice(photoIndex, 1);
    }
}
openCamera(index: number) {
  this.isCameraOpen = true;
  this.activeIndex = index;

  const videoElement = this.videoElements?.toArray()[index]?.nativeElement;
  if (!videoElement) {
    console.error(`⚠️ Impossible de trouver l'élément vidéo à l'index ${index}`);
    return;
  }

  navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
      videoElement.srcObject = stream;

      // ✅ Attendre que la vidéo soit bien chargée avant d'autoriser la capture
      videoElement.onloadedmetadata = () => {
        videoElement.play(); // Démarre la vidéo seulement après le chargement
      };
    })
    .catch((error) => {
      console.error('🚨 Erreur lors de l’ouverture de la caméra:', error);
    });
}


/** ✅ CAPTURE DE PHOTO */
capturePhoto(index: number) {
  const videoElement = this.videoElements?.toArray()[index]?.nativeElement;
  if (!videoElement || videoElement.videoWidth === 0) {
    console.warn('⚠️ Caméra non prête, veuillez réessayer...');
    return;
  }

  setTimeout(() => { // ✅ Délai pour éviter capture instantanée
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = "white"; // ✅ Évite le fond noir
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });

        // ✅ Évite d’ajouter des images vides
        if (!this.photosPreviews[index]) {
          this.photosPreviews[index] = [];
        }

        this.newPhotos.push(file);
        this.photosPreviews[index].push(URL.createObjectURL(file));

        // ✅ Fermer la caméra après capture
        const tracks = (videoElement.srcObject as MediaStream)?.getTracks();
        tracks?.forEach((track) => track.stop());
        this.isCameraOpen = false;
      }
    }, 'image/jpeg');
  }, 500);
}

  supprimerPhoto(avarieIndex: number, photoIndex: number) {
    if (this.photosPreviews[avarieIndex] && this.photosPreviews[avarieIndex][photoIndex]) {
      const photoUrl = this.photosPreviews[avarieIndex][photoIndex];

      const photo = this.data.vehicule.avaries[avarieIndex]?.photos?.find((p: any) => p.fileName === photoUrl);
      if (photo?.id) {
        this.deletedPhotoIds.push(photo.id);
      }

      this.photosPreviews[avarieIndex].splice(photoIndex, 1);
    }
  }


  enregistrer() {
    const vehiculeData = { 
        id: this.data.vehicule?.id, 
        modele: this.form.value.modele,
        numeroChassis: this.form.value.numeroChassis,
        couleur: this.form.value.couleur,
        dateArrivee: this.form.value.dateArrivee,
        provenance: this.form.value.provenance,
        avaries: this.form.value.avaries.map((avarie: any, index: number) => ({
            id: avarie.id || null,
            type: avarie.type,
            commentaire: avarie.commentaire,
            photos: this.photosPreviews[index]?.filter(photo => typeof photo === 'string') || [] // ✅ Garde seulement les URLs
        }))
    };

    // ✅ Utilise directement les fichiers stockés dans `onFileChange()`
    const newPhotos: File[] = [...this.newPhotos]; 

    console.log('🚀 Données envoyées à la modif :', vehiculeData);
    console.log('🗑️ Photos supprimées :', this.deletedPhotoIds);
    console.log('📸 Nouvelles photos (fichiers détectés) :', newPhotos.map(file => file.name));

    this.dialogRef.close({ 
        action: 'update', 
        data: vehiculeData, 
        deletedPhotoIds: this.deletedPhotoIds,  
        newPhotos: newPhotos // ✅ Envoie uniquement les fichiers au backend
    });
}

  supprimer() {
    console.log('🗑️ Suppression demandée pour ID :', this.data.vehicule.id);
    this.dialogRef.close({ action: 'delete', data: { id: this.data.vehicule.id } });
  }

  get avaries(): FormArray {
    return this.form.get('avaries') as FormArray;
  }
}
