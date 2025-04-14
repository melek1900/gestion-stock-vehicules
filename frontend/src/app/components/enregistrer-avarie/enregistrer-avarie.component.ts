import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgIf, NgFor, CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

// 📌 Scanner QR Code (ZXing)
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/browser';
import { Vehicule } from '../../../services/vehicule.service';
import { AuthService } from '../../../services/auth.service';
import { ParcService } from '../../../services/parc.service';
import { JwtHelperService } from '@auth0/angular-jwt';
@Component({
  selector: 'app-enregistrer-avarie',
  imports: [ ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSnackBarModule,
    MatCardModule,
    MatSelectModule,
    NgIf,
    NgFor,
    ZXingScannerModule,
    MatIconModule],
  templateUrl: './enregistrer-avarie.component.html',
  styleUrl: './enregistrer-avarie.component.scss'
})
export class EnregistrerAvarieComponent {
  @ViewChild('videoElement') videoElement!: ElementRef;
  form: FormGroup;
  isScanning = false;
  qrResult: string = '';
  scannerFormats = [BarcodeFormat.QR_CODE];
  avaries!: FormArray;
  photoPreviews: string[][] = [];
  photosParAvarie: { [key: string]: File[] } = {};

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

  ngOnInit() {
    // 1. Initialisation du parc
    this.getParcId();
  
    // 2. Récupération des queryParams (scanner ou manuel)
    this.route.queryParams.subscribe(params => {
      const numeroChassis = params['numeroChassis'];
      const parcNom = params['parc'];
  
      if (numeroChassis) {
        this.form.controls['numeroChassis'].setValue(numeroChassis);
        this.qrResult = numeroChassis;
        this.verifierVehicule(numeroChassis);
        this.snackBar.open("✅ Numéro de châssis détecté automatiquement", "Fermer", { duration: 2500 });
      }
  
      if (parcNom) {
        const parcId = this.getParcIdDepuisUrl(); // synchronise bien le parc
        this.form.controls['parc'].setValue({ id: parcId });
      }
    });
  
    // 3. Pré-remplissage lors de la saisie manuelle du numéro de châssis
    this.form.get('numeroChassis')?.valueChanges.subscribe(numeroChassis => {
      if (numeroChassis && numeroChassis.length >= 5) { // évite les appels à chaque lettre
        this.verifierVehicule(numeroChassis);
      }
    });
  }
  
  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private route: ActivatedRoute,
    private parcService: ParcService,
  ) {
    this.form = this.fb.group({
      numeroChassis: ['', Validators.required],
      modele: ['', Validators.required],
      description: ['', Validators.required],
      engine: ['', Validators.required],
      keyCode: ['', Validators.required],
      couleur: ['', Validators.required],
      parc: [null, Validators.required],
      avaries: this.fb.array([]),
    });
  
    this.avaries = this.form.get('avaries') as FormArray;
  
    // ✅ 1. Détection du rôle pour thème dynamique
    const token = localStorage.getItem('token');
    if (token) {
      const helper = new JwtHelperService();
      const decoded = helper.decodeToken(token);
      this.isGestionnaire = decoded.role === 'ROLE_GESTIONNAIRE_STOCK';
    }
  
    // ✅ 2. Pré-remplissage via queryParams
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
        const mappingParc: Record<string, number> = {
          'MEGRINE': 1, 'A': 1,
          'CHARGUIA': 2, 'B': 2,
          'AUPORT': 4, 'C': 4,
        };
  
        const parcId = mappingParc[parcNom.toUpperCase()] || 1;
        this.parcId = parcId;
        this.form.controls['parc'].setValue(parcId);
        console.log("✅ Parc ID détecté via URL :", parcId);
      } else if (token) {
        // ✅ Fallback : récupération depuis token si pas dans URL
        const helper = new JwtHelperService();
        const decoded = helper.decodeToken(token);
        if (decoded.parcId) {
          this.parcId = decoded.parcId;
          this.form.controls['parc'].setValue(this.parcId);
          console.log("✅ Parc ID détecté via token :", this.parcId);
        }
      }
    });
  
    // ✅ Bonus : remplissage automatique en tapant manuellement un numéro
    this.form.get('numeroChassis')?.valueChanges.subscribe(numero => {
      if (numero) {
        this.verifierVehicule(numero);
      }
    });
  }
  envoyerAvarieDirectement(numeroChassis: string, avarie: any, index: number) {
    const formData = new FormData();
  
    const avarieSansPhotos = { ...avarie };
    delete avarieSansPhotos.photos;
  
    formData.append('avarie', JSON.stringify(avarieSansPhotos));
  
    if (avarie.photos && avarie.photos.length) {
      avarie.photos.forEach((photoBase64: string, i: number) => {
        const blob = this.dataURLtoBlob(photoBase64);
        formData.append('photos', blob, `photo_${index}_${i}.png`);
      });
    }
  
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token')}`
    });
  
    this.http.post(`http://localhost:8080/api/vehicules/${numeroChassis}/avarie`, formData, { headers }).subscribe({
      next: () => {
        this.snackBar.open("✅ Avarie enregistrée avec succès", "Fermer", { duration: 3000 });
        if (index === this.avariesConfirmees.length - 1) {
          this.resetForm();
        }
      },
      error: (err) => {
        console.error("❌ Erreur lors de l'enregistrement de l'avarie :", err);
        this.snackBar.open("❌ Échec de l'enregistrement de l'avarie", "Fermer", { duration: 3000 });
      }
    });
  }
  
  
  /** ✅ Détection dynamique de l'ID du parc */
  getParcId() {
    const parcIdFromUrl = this.route.snapshot.queryParams['parc'];
    console.log("🔍 Vérification brute de `parcIdFromUrl`:", parcIdFromUrl, "Type:", typeof parcIdFromUrl);

    if (parcIdFromUrl) {
        // 🔹 Vérifier si `parcIdFromUrl` est bien une chaîne
        const mappingParcId: { [key: string]: number } = {
            'MEGRINE': 1,
            'A': 1,
            'CHARGUIA': 2,
            'B': 2,
            'AUPORT': 4,
            'C': 4,
        };

        // 🔹 Vérifier si la valeur existe dans le mapping
        if (mappingParcId[parcIdFromUrl]) {
            this.parcId = mappingParcId[parcIdFromUrl]; // 🔥 Récupération sûre
        } else {
            console.warn("⚠️ Parc non reconnu, utilisation de la valeur par défaut.");
            this.parcId = 1;
        }

        console.log("📌 Parc ID attribué:", this.parcId);
    } else {
        console.warn("⚠️ `parcIdFromUrl` est NULL ou UNDEFINED, tentative récupération utilisateur...");
        this.authService.getUser().subscribe(user => {
            if (user && user.parcId) {
                this.parcId = user.parcId;
                console.log("🟢 Parc ID récupéré depuis l'utilisateur :", this.parcId);
            } else {
                this.parcId = 1;
                console.log("⚠️ Parc ID non trouvé, valeur par défaut :", this.parcId);
            }
            this.form.controls['parc'].setValue(this.parcId);
        });
    }

    // 🔹 Vérification finale et correction si `NaN`
    if (isNaN(this.parcId)) {
        console.error("🚨 ERREUR: `parcId` est NaN après attribution, correction en 1 !");
        this.parcId = 1;
    }

    this.form.controls['parc'].setValue(this.parcId);
}

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
  
          this.form.updateValueAndValidity();  // ✅ Force la réévaluation
  
          console.log("✅ Formulaire après remplissage:", this.form.valid, this.form.value);
        },
        error: () => this.isExistingVehicle = false
      });
  }
  confirmerAvarie(index: number) {
    const avarie = this.avaries.at(index).value;
    const key = `av${Date.now()}_${index}`;
  
    const photos = this.avaries.at(index).get('photos') as FormArray;
    const files: File[] = photos.controls.map(c => c.value);
  
    this.photosParAvarie[key] = files;
  
    this.avariesConfirmees.push({
      type: avarie.type,
      commentaire: avarie.commentaire,
      key,
      photos: this.photoPreviews[index] || []
    });
  
    this.avaries.removeAt(index);
    this.photoPreviews.splice(index, 1);
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
  enregistrerAvaries() {
    const numeroChassis = this.form.get('numeroChassis')?.value;
    if (!numeroChassis) {
      this.snackBar.open("🚨 Numéro de châssis manquant", "Fermer", { duration: 3000 });
      return;
    }
  
    if (!this.avariesConfirmees.length) {
      this.snackBar.open("🚨 Aucune avarie confirmée", "Fermer", { duration: 3000 });
      return;
    }
  
    const formData = new FormData();
    formData.append('numeroChassis', numeroChassis);
    formData.append('parcId', this.parcId?.toString() || '1');
  
    const avariesPayload = this.avariesConfirmees.map((av, index) => ({
      type: av.type,
      commentaire: av.commentaire,
      key: av.key || `av${index}`
    }));
  
    formData.append('avarie', JSON.stringify(avariesPayload));
  
    avariesPayload.forEach(avarie => {
      const photos = this.photosParAvarie[avarie.key] || [];
      photos.forEach((file: File, i: number) => {
        formData.append('photos', file, `photo-${avarie.key}-${i}.png`);
      });
    });
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
  
    this.http.post(`http://localhost:8080/api/vehicules/reception`, formData, { headers }).subscribe({
      next: () => {
        this.snackBar.open("✅ Véhicule + avaries enregistrés avec succès !", "Fermer", { duration: 3000 });
        this.router.navigate(['/creer-avarie']);
      },
      error: (err) => {
        console.error("❌ Erreur enregistrement :", err);
        this.snackBar.open("❌ Échec de l'enregistrement", "Fermer", { duration: 3000 });
      }
    });
  }
  enregistrerVehicule() {
    if (this.form.invalid) {
      this.snackBar.open('🚨 Formulaire invalide', 'Fermer', { duration: 3000 });
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control && control.invalid) {
          console.warn(`❌ Champ invalide : ${key}`, control.errors);
        }
      });
      return;
    }
  
    const formData = new FormData();
    formData.append('numeroChassis', this.form.value.numeroChassis);
    formData.append('parcId', this.parcId?.toString() || '1');
  
    // Ajouter la première avarie confirmée sans les photos
    if (this.avariesConfirmees.length > 0) {
      const avarie = { ...this.avariesConfirmees[0] };
      if (Array.isArray(avarie.photos)) {
        avarie.photos = avarie.photos.filter((photo: any) => Object.keys(photo).length > 0);
      }
      delete avarie.photos;
      formData.append('avarie', JSON.stringify(avarie));
    } else {
      formData.append('avarie', "");
    }
  
    // Ajouter les fichiers photo
    this.photos.forEach(photo => {
      formData.append('photos', photo);
    });
  
    // Log FormData
    console.log("✅ FormData avant envoi:");
    for (let pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1] instanceof File ? (pair[1] as File).name : pair[1]);
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
  
    this.http.post(`http://localhost:8080/api/vehicules/reception`, formData, { headers }).subscribe({
      next: () => {
        this.snackBar.open("🚗 Véhicule réceptionné avec succès !", "Fermer", { duration: 3000 });
  
        const token = localStorage.getItem('token');
        const role = token ? new JwtHelperService().decodeToken(token).role.replace('ROLE_', '').toUpperCase() : null;
  
        if (role === "GESTIONNAIRE_STOCK") {
          this.router.navigate(['/gestionnaire-stock-dashboard']);
        } else {
          this.router.navigate(['/vehicules']);
        }
      },
      error: (err) => {
        console.error("❌ Erreur réception véhicule:", err);
        this.snackBar.open("❌ Échec de la réception du véhicule", "Fermer", { duration: 3000 });
      }
    });
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
