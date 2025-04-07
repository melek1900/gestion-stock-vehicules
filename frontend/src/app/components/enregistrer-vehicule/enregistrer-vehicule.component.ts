import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgIf, NgFor } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { NgClass } from '@angular/common';

// 📌 Scanner QR Code (ZXing)
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/browser';
import { Vehicule } from '../../../services/vehicule.service';
import { AuthService } from '../../../services/auth.service';
import { ParcService } from '../../../services/parc.service';
import { JwtHelperService } from '@auth0/angular-jwt';

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
    MatIconModule,
    NgClass
  ],
})

export class EnregistrerVehiculeComponent {
  @ViewChild('videoElement') videoElement!: ElementRef;
  form: FormGroup;
  isScanning = false;
  qrResult: string = '';
  scannerFormats = [BarcodeFormat.QR_CODE];
  avaries!: FormArray;  // ✅ Déclaration correcte de avaries
  photoPreviews: string[][] = []; // ✅ Liste des photos prévisualisées
  isCameraOpen = false;
  activeIndex: number | null = null;
  isCapturing = false;
  isExistingVehicle = false;
  statutVehicule: string | null = null;
  imageAgrandie: string | null = null;
  isUsingFrontCamera = false;
  typesAvaries: string[] = ['Rayure', 'Bosse', 'Pièce manquante', 'Autre'];
  avariesConfirmees: any[] = [];
  parcId!: number; 
  photos: File[] = [];
  isGestionnaire = false;


  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private route: ActivatedRoute,
    private parcService: ParcService
  ) {
    // 1️⃣ Initialiser le parc par défaut
    this.parcId = this.getParcIdDepuisUrlSync(); // fallback par défaut
    this.isGestionnaire = false;
  
    // 2️⃣ Créer le formulaire (1 seule fois)
    this.form = this.fb.group({
      numeroChassis: ['', Validators.required],
      modele: ['', Validators.required],
      description: ['', Validators.required],
      engine: ['', Validators.required],
      keyCode: ['', Validators.required],
      couleur: ['', Validators.required],
      parc: [this.parcId, Validators.required],
      avaries: this.fb.array([]),
    });
    this.avaries = this.form.get('avaries') as FormArray;
  
    // 3️⃣ Récupérer token et décoder les infos utiles
    const token = localStorage.getItem('token');
    if (token) {
      const helper = new JwtHelperService();
      const decoded = helper.decodeToken(token);
      this.isGestionnaire = decoded.role === 'ROLE_GESTIONNAIRE_STOCK';
  
      if (decoded.parcId) {
        this.parcId = decoded.parcId;
        this.form.controls['parc'].setValue(this.parcId);
        console.log("✅ Parc ID détecté via token JWT :", this.parcId);
      } else {
        console.warn("⚠️ Parc ID non trouvé dans le token, fallback via URL :", this.parcId);
      }
    }
  
    // 4️⃣ Gérer les queryParams (scan ou redirection)
    this.route.queryParams.subscribe(params => {
      const numeroChassis = params['numeroChassis'];
      const parcNom = params['parc'];
  
      if (numeroChassis) {
        this.form.controls['numeroChassis'].setValue(numeroChassis);
        this.qrResult = numeroChassis;
        this.verifierVehicule(numeroChassis);
        this.snackBar.open("📦 Numéro de châssis détecté automatiquement", "Fermer", { duration: 2500 });
      }
  
      if (parcNom) {
        const parcId = this.getParcIdDepuisUrlSync();
        this.form.controls['parc'].setValue(parcId);
      }
    });
  
    // 5️⃣ Activation du préremplissage si saisie manuelle
    this.form.get('numeroChassis')?.valueChanges.subscribe(numeroChassis => {
      if (numeroChassis) {
        this.verifierVehicule(numeroChassis);
      }
    });
  }
  
  getParcIdDepuisUrlSync(): number {
    const parcNom = this.route.snapshot.queryParams['parc'] || this.route.snapshot.paramMap.get('parc');
    console.log("🔍 Parc détecté depuis l'URL :", parcNom);
  
    const mappingParcNomToId: Record<string, number> = {
      'MEGRINE': 1,
      'A': 1,
      'CHARGUIA': 2,
      'B': 2,
    };
  
    if (parcNom && mappingParcNomToId[parcNom.toUpperCase()]) {
      return mappingParcNomToId[parcNom.toUpperCase()];
    }
  
    return 1; // Valeur par défaut
  }
  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      this.photos = Array.from(event.target.files);
      console.log("📸 Photos sélectionnées :", this.photos);
    }
  }
  /** ✅ Détection dynamique de l'ID du parc */
//   getParcId() {
//     const parcIdFromUrl = this.route.snapshot.queryParams['parc'];
//     console.log("🔍 Vérification brute de `parcIdFromUrl`:", parcIdFromUrl, "Type:", typeof parcIdFromUrl);

//     if (parcIdFromUrl) {
//         // 🔹 Vérifier si `parcIdFromUrl` est bien une chaîne
//         const mappingParcId: { [key: string]: number } = {
//             'MEGRINE': 1,
//             'A': 1,
//             'CHARGUIA': 2,
//             'B': 2,
//             'AUPORT': 4,
//             'C': 4,
//         };

//         // 🔹 Vérifier si la valeur existe dans le mapping
//         if (mappingParcId[parcIdFromUrl]) {
//             this.parcId = mappingParcId[parcIdFromUrl]; // 🔥 Récupération sûre
//         } else {
//             console.warn("⚠️ Parc non reconnu, utilisation de la valeur par défaut.");
//             this.parcId = 1;
//         }

//         console.log("📌 Parc ID attribué:", this.parcId);
//     } else {
//         console.warn("⚠️ `parcIdFromUrl` est NULL ou UNDEFINED, tentative récupération utilisateur...");
//         this.authService.getUser().subscribe(user => {
//             if (user && user.parcId) {
//                 this.parcId = user.parcId;
//                 console.log("🟢 Parc ID récupéré depuis l'utilisateur :", this.parcId);
//             } else {
//                 this.parcId = 1;
//                 console.log("⚠️ Parc ID non trouvé, valeur par défaut :", this.parcId);
//             }
//             this.form.controls['parc'].setValue(this.parcId);
//         });
//     }

//     // 🔹 Vérification finale et correction si `NaN`
//     if (isNaN(this.parcId)) {
//         console.error("🚨 ERREUR: `parcId` est NaN après attribution, correction en 1 !");
//         this.parcId = 1;
//     }

//     this.form.controls['parc'].setValue(this.parcId);
// }

  ajouterAvarie() {
    this.avaries.push(this.fb.group({
      type: ['', Validators.required],
      commentaire: [''],
      photos: this.fb.array([]),
    }));
  }
  /** ✅ Démarrer le scanner QR Code */
  startScanner() {
    this.isScanning = true;
  }

  /** ✅ Capture du QR Code */
  onCodeResult(resultString: string) {
    console.log("📷 QR Code détecté :", resultString);
    if (!resultString) {
      console.error("🚨 QR Code invalide !");
      return;
    }
    this.qrResult = resultString;
    this.form.controls['numeroChassis'].setValue(resultString);
    this.isScanning = false;
    this.verifierVehicule(resultString);
  }
  verifierVehicule(numeroChassis: string) {
    this.http.get<Vehicule>(`http://localhost:8080/api/vehicules/chassis/${numeroChassis}`)
      .subscribe({
        next: (vehicule) => {
          console.log("📌 Véhicule trouvé :", vehicule);
          
          this.form.patchValue({
            modele: vehicule.modele || '',
            couleur: vehicule.couleur || '',
            description: vehicule.description || '',
            engine: vehicule.engine || '',
            keyCode: vehicule.keyCode || '',
            production: vehicule.production || '',
            statut: vehicule.statut || '',
            parc: vehicule.parc?.id || this.getParcIdDepuisUrl(),
          });
  
          this.form.updateValueAndValidity();
  
          console.log("✅ Formulaire après remplissage:", this.form.valid, this.form.value);
        },
        error: (err) => {
          this.isExistingVehicle = false;
          console.warn("❌ Numéro de châssis non trouvé :", numeroChassis);
          this.snackBar.open("🚨 Numéro de châssis introuvable !", "Fermer", { duration: 4000 });
        
          // Réinitialiser les champs du formulaire s’ils contiennent encore des données
          this.form.patchValue({
            modele: '',
            couleur: '',
            description: '',
            engine: '',
            keyCode: '',
            production: '',
            statut: '',
            parc: this.getParcIdDepuisUrl()
          });
        }
      });
  }
  confirmerAvarie(index: number) {
    const avarie = this.avaries.at(index).value;

    // 📌 Ajouter la liste des photos à l'avarie confirmée
    const photos = this.photoPreviews[index] || [];

    this.avariesConfirmees.push({
        type: avarie.type,
        commentaire: avarie.commentaire,
        photos: [...photos] // Ajout des photos associées
    });

    // 🔥 Supprimer l'avarie de la liste en cours
    this.avaries.removeAt(index);
    this.photoPreviews.splice(index, 1);

    this.snackBar.open("✅ Avarie confirmée avec succès", "Fermer", { duration: 3000 });
}
  supprimerAvarieConfirmee(index: number) {
    this.avariesConfirmees.splice(index, 1);
    this.snackBar.open("❌ Avarie supprimée", "Fermer", { duration: 3000 });
  }

  supprimerAvarie(index: number) {
    this.avaries.removeAt(index);
    this.photoPreviews.splice(index, 1);
  }

  /** ✅ Ajouter une photo */
  onFileChange(event: any, avarieIndex: number) {
    const file = event.target.files[0];
    if (!file) return;
  
    console.log("📸 Photo ajoutée :", file.name);
  
    // ✅ Vérifier si `photos` est bien initialisé
    if (!this.photos) {
      this.photos = [];
    }
  
    // ✅ Ajouter la photo dans la liste globale
    this.photos.push(file);
  
    // ✅ Vérifier si l'index existe dans la liste des avaries
    if (this.avaries.length <= avarieIndex) {
      console.error("🚨 Erreur : Aucune avarie trouvée à l'index", avarieIndex);
      return;
    }
  
    // ✅ Récupérer l'avarie et s'assurer que c'est un FormGroup
    const avarie = this.avaries.at(avarieIndex) as FormGroup;
    if (!avarie) {
      console.error("🚨 Erreur : Impossible de récupérer l'avarie à l'index", avarieIndex);
      return;
    }
  
    // ✅ Vérifier si le champ 'photos' existe, sinon l'initialiser
    if (!avarie.get('photos')) {
      avarie.addControl('photos', this.fb.array([]));
    }
  
    // ✅ Stocker l'image dans le formulaire de l'avarie
    const photosArray = avarie.get('photos') as FormArray;
    photosArray.push(this.fb.control(file));
  
    // ✅ Ajouter la photo à la prévisualisation
    if (!this.photoPreviews[avarieIndex]) {
      this.photoPreviews[avarieIndex] = [];
    }
  
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.photoPreviews[avarieIndex].push(e.target.result);
      console.log("🔍 Nouvelle prévisualisation :", this.photoPreviews[avarieIndex]);
    };
    reader.readAsDataURL(file);
  }

  /** ✅ Supprimer une photo */
  removePhoto(avarieIndex: number, photoIndex: number) {
    if (this.photoPreviews[avarieIndex]) {
      this.photoPreviews[avarieIndex].splice(photoIndex, 1);
    }
  }

  /** ✅ Ouvrir une image en plein écran */
  ouvrirImage(src: string) {
    this.imageAgrandie = src;
  }

  fermerImage() {
    this.imageAgrandie = null;
  }

  /** ✅ Gérer la caméra */
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
    }, 100); // ✅ Petit délai pour éviter un bug d'affichage
  }

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
  

  closeCamera() {
    this.isCameraOpen = false;
    this.activeIndex = null;
  
    const video = this.videoElement?.nativeElement;
    if (video && video.srcObject) {
      const stream = video.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop()); // ✅ Arrête la caméra proprement
    }
  }

  toggleCamera(index: number) {
    this.isUsingFrontCamera = !this.isUsingFrontCamera;
    console.log("🔄 Caméra changée");
  }

  enregistrerVehicule() {
    if (this.form.invalid) {
      this.snackBar.open('🚨 Formulaire invalide', 'Fermer', { duration: 3000 });
      return;
    }
  
    const formData = new FormData();
    formData.append('numeroChassis', this.form.value.numeroChassis);
    formData.append('parcId', this.parcId ? this.parcId.toString() : '1');
  
    if (this.avariesConfirmees.length > 0) {
      const avarie = { ...this.avariesConfirmees[0] };
    
      // 🔍 Vérifie que "photos" est un tableau avant d'appliquer le filtre
      if (Array.isArray(avarie.photos)) {
        avarie.photos = avarie.photos.filter((photo: Record<string, any>) => Object.keys(photo).length > 0);
      }
      delete avarie.photos;

      formData.append('avarie', JSON.stringify(avarie));
    } else {
      formData.append('avarie', "");
    }
  
    if (this.photos && this.photos.length > 0) {
      this.photos.forEach((photo) => {
        formData.append('photos', photo);
      });
    }
  
    // ✅ Ajout du log AVANT l'envoi
    console.log("✅ FormData avant envoi:");
    for (let pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(`${pair[0]}:`, pair[1].name); // Afficher seulement le nom du fichier
      } else {
        console.log(`${pair[0]}:`, pair[1]);
      }
    }
  
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      })
    };
  
    this.http.post(
      `http://localhost:8080/api/vehicules/reception`,
      formData,
      {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }),
        responseType: 'text' as 'json'
      }
    ).subscribe({
      next: () => {
        this.snackBar.open("🚗 Véhicule réceptionné avec succès !", "Fermer", { duration: 3000 });
        const token = localStorage.getItem('token');
        if (token) {
          const jwtHelper = new JwtHelperService();
          const decodedToken = jwtHelper.decodeToken(token);
          const role = decodedToken.role.replace('ROLE_', '').toUpperCase(); // Normalisation
  
          console.log("🎯 Rôle détecté :", role);
  
          if (role === "GESTIONNAIRE_STOCK") {
            this.router.navigate(['/gestionnaire-stock-dashboard']);
          } else {
            this.router.navigate(['/vehicules']);
          }
        } else {
          console.warn("⚠️ Aucun token trouvé, redirection vers /vehicules par défaut");
          this.router.navigate(['/vehicules']);
        }
      },
      error: (err) => {
        console.error("❌ Erreur réception véhicule:", err);
    
        if (err.status === 409 && typeof err.error === 'string' && err.error.includes("déjà dans le parc")) {
          this.snackBar.open("🚫 Ce véhicule est déjà réceptionné dans ce parc !", "Fermer", { duration: 4000 });
        } else {
          this.snackBar.open("❌ Échec de la réception du véhicule", "Fermer", { duration: 3000 });
        }
      }
    });
    if (this.form.invalid) {
      console.warn("🚨 Formulaire invalide !");
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control && control.invalid) {
          console.log(`❌ Champ invalide : ${key}`, control.errors);
        }
      });
      this.snackBar.open('🚨 Formulaire invalide', 'Fermer', { duration: 3000 });
      return;
    }
  }
  getPhotoUrl(photoId: number): string {
    return `http://localhost:8080/photos/${photoId}`;
  }
/** ✅ Rafraîchir les données du véhicule après mise à jour */
refreshVehiculeData(numeroChassis: string) {
  this.http.get<Vehicule>(`http://localhost:8080/api/vehicules/chassis/${numeroChassis}?nocache=${new Date().getTime()}`)
    .subscribe({
      next: (updatedVehicule) => {
        console.log("✅ Véhicule mis à jour récupéré :", updatedVehicule);
        this.form.patchValue({
          modele: updatedVehicule.modele,
          couleur: updatedVehicule.couleur,
          description: updatedVehicule.description,
          engine: updatedVehicule.engine,
          keyCode: updatedVehicule.keyCode,
          pegCode: updatedVehicule.peg,
          dateArrivee: updatedVehicule.dateArrivee,
          statut: updatedVehicule.statut
        });
      },
      error: (error) => {
        console.error("🚨 Erreur lors de la récupération du véhicule mis à jour :", error);
      }
    });
}

// receptionnerVehicule() {
//   const numeroChassis = this.form.get('numeroChassis')?.value;
//   const parcId = this.getParcIdDepuisUrl(); // ✅ Parc détecté automatiquement
//   console.log("🔍 Vérification immédiate de parcId:", parcId, "Type:", typeof parcId);
//   if (isNaN(parcId)) {
//     console.error("🚨 ERREUR: parcId est toujours NaN après correction !");
//   }


//   if (!numeroChassis) {
//     this.snackBar.open("🚨 Numéro de châssis manquant", "Fermer", { duration: 3000 });
//     return;
//   }

//   console.log("🚀 Réception du véhicule :", numeroChassis, "vers le parc :", parcId);

//   const httpOptions = {
//     headers: new HttpHeaders({ 'Authorization': `Bearer ${localStorage.getItem('token')}` })
//   };

//   this.http.post(`http://localhost:8080/api/vehicules/reception`, null, {
//     params: { numeroChassis, parcId }
//   }).subscribe({
//     next: (response: any) => {
//       console.log("✅ Réception réussie :", response);
//       this.snackBar.open("🚗 Véhicule réceptionné avec succès !", "Fermer", { duration: 3000 });
//       this.router.navigate(['/vehicules']);
//     },
//     error: (error) => {
//       console.error("🚨 Erreur lors de la réception :", error);
//       this.snackBar.open("❌ Échec de la réception du véhicule", "Fermer", { duration: 3000 });
//     }
//   });
// }

/** ✅ Convertir une image en base64 vers un Blob */
dataURLtoBlob(dataUrl: string) {
  let arr = dataUrl.split(','), 
      mime = arr[0].match(/:(.*?);/)![1],
      bstr = atob(arr[1]), 
      n = bstr.length, 
      u8arr = new Uint8Array(n);
  
  while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}


getParcIdDepuisUrl(): void {
  const parcNom = this.route.snapshot.paramMap.get('parc') || this.route.snapshot.queryParams['parc'];
  console.log("🔍 Parc détecté depuis l'URL :", parcNom);

  if (!parcNom) {
    console.warn("⚠️ Aucun parc trouvé dans l'URL, utilisation de la valeur par défaut.");
    this.parcId = 1; // Valeur par défaut si aucun parc n'est trouvé
    return;
  }

  this.parcService.getParcs().subscribe(parcs => {
    const parcTrouve = parcs.find(parc => parc.nom.toUpperCase() === parcNom.toUpperCase());

    if (parcTrouve) {
      this.parcId = parcTrouve.id;
      console.log("✅ Parc ID attribué dynamiquement:", this.parcId);
    } else {
      console.warn(`⚠️ Parc '${parcNom}' non trouvé en base, utilisation de la valeur par défaut.`);
      this.parcId = 1;
    }

    // ✅ Mise à jour du formulaire avec l'ID du parc
    this.form.controls['parc'].setValue(this.parcId);
  }, error => {
    console.error("🚨 Erreur lors de la récupération des parcs :", error);
    this.parcId = 1; // Valeur de secours
  });
}


  envoyerAvarieEtPhotos(vehiculeId: number, avarie: any, index: number) {
    const avarieData = { ...avarie, vehiculeId };
  
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      console.log("🔍 Token décodé :", decodedToken);
      console.log("🔍 Rôle extrait :", decodedToken.role);
    }
  
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  
    this.http.post(`http://localhost:8080/api/avaries`, avarieData, httpOptions).subscribe({
      next: (avarieEnregistree: any) => {
        console.log("✅ Avarie enregistrée :", avarieEnregistree);
        
        // ✅ Si l'avarie a été enregistrée, envoyer les photos associées
        if (this.photoPreviews[index] && this.photoPreviews[index].length) {
          this.photoPreviews[index].forEach((photo, i) => {
            this.envoyerPhoto(avarieEnregistree.id, photo, i);
          });
        }
      },
      error: (error) => {
        console.error("🚨 Erreur lors de l'enregistrement de l’avarie :", error);
      }
    });
  }

  enregistrerAvaries() {
    if (!this.form.value.avaries?.length) {
      console.warn("⚠️ Aucun enregistrement d'avarie, la liste est vide.");
      return;
    }
  
    const numeroChassis = this.form.get('numeroChassis')?.value;
    if (!numeroChassis) {
      console.error("🚨 Erreur : numéro de châssis non défini !");
      return;
    }
  
    this.form.value.avaries.forEach((avarie: any, index: number) => {
      console.log(`📡 Envoi de l'avarie ${index + 1}:`, avarie);
      this.envoyerAvarieEtPhotos(numeroChassis, avarie, index);
    });
  }
  envoyerPhoto(avarieId: number, photoBase64: string, index: number) {
    if (!photoBase64.startsWith("data:image/")) {
      console.error("🚨 Erreur : format de l'image incorrect", photoBase64);
      return;
    }
  
    const formData = new FormData();
    const blob = this.dataURLtoBlob(photoBase64);
    formData.append('photo', blob, `photo_${index}.png`);
    formData.append('avarieId', avarieId.toString());
  
    console.log(`📡 Envoi de la photo ${index + 1} pour l'avarie ${avarieId}`);
    this.http.post(`http://localhost:8080/api/photos`, formData).subscribe({
      next: () => console.log(`✅ Photo ${index + 1} envoyée`),
      error: (error) => console.error(`❌ Erreur lors de l'envoi de la photo ${index + 1} :`, error)
    });
  }
  /** ✅ Réinitialisation du formulaire après enregistrement */
  resetForm() {
    this.form.reset();
    this.photoPreviews = [];
    this.avaries.clear();
  }
}
