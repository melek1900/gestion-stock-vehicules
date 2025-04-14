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
  form: FormGroup;
  isScanning = false;
  qrResult: string = '';
  scannerFormats = [BarcodeFormat.QR_CODE];
  avaries!: FormArray;  // ✅ Déclaration correcte de avaries
  photoPreviews: string[][] = []; // ✅ Liste des photos prévisualisées
  photosParAvarie: { [key: string]: File[] } = {};

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
  
    // 🔑 Créer une clé unique
    const key = `av${Date.now()}_${index}`;
  
    // 📸 Extraire les fichiers depuis le FormArray photos
    const photosArray = this.avaries.at(index).get('photos') as FormArray;
    const files: File[] = photosArray.controls.map(ctrl => ctrl.value);
  
    // 🗂 Associer les fichiers à cette avarie via la clé
    this.photosParAvarie[key] = files;
  
    // 📝 Ajouter à la liste des avaries confirmées
    this.avariesConfirmees.push({
      type: avarie.type,
      commentaire: avarie.commentaire,
      key: key,
      photos: this.photoPreviews[index] || []  // 🟢 Ajoute les previews
    });
  
    // 🔥 Nettoyage
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
    const confirmed = this.avariesConfirmees.find(av => av.index === avarieIndex);
  if (confirmed && confirmed.key) {
  if (!this.photosParAvarie[confirmed.key]) {
    this.photosParAvarie[confirmed.key] = [];
  }
  this.photosParAvarie[confirmed.key].push(file);
}
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
  envoyerAvarieAvecPhotos(vehiculeId: number, avarie: any, index: number) {
    if (!vehiculeId || !avarie || !avarie.type) {
      console.warn("🚨 Données invalides pour l'envoi d'une avarie :", { vehiculeId, avarie });
      return;
    }
  
    const formData = new FormData();
  
    // ✅ Ajouter les champs texte de l’avarie
    const avariePayload = {
      type: avarie.type,
      commentaire: avarie.commentaire || ''
    };
    formData.append("avarie", JSON.stringify(avariePayload));
  
    // ✅ Ajouter les photos associées (si disponibles)
    const photoList = this.photoPreviews[index];
    if (photoList && Array.isArray(photoList)) {
      photoList.forEach((photoBase64: string, i: number) => {
        if (photoBase64.startsWith("data:image")) {
          const blob = this.dataURLtoBlob(photoBase64);
          formData.append("photos", blob, `photo_${i}.png`);
        } else {
          console.warn(`⚠️ Format non supporté pour la photo ${i} :`, photoBase64);
        }
      });
    }
  
    const token = localStorage.getItem('token');
  
    this.http.post(
      `http://localhost:8080/api/vehicules/${vehiculeId}/avaries/photos`,
      formData,
      {
        headers: new HttpHeaders({
          'Authorization': `Bearer ${token}`
        })
      }
    ).subscribe({
      next: (res) => {
        console.log(`✅ Avarie #${index + 1} envoyée avec succès pour véhicule ID ${vehiculeId}`, res);
        this.snackBar.open(`✅ Avarie ${index + 1} enregistrée`, 'Fermer', { duration: 2500 });
      },
      error: (err) => {
        console.error(`❌ Erreur envoi avarie #${index + 1} :`, err);
        this.snackBar.open(`❌ Échec ajout avarie ${index + 1}`, 'Fermer', { duration: 3000 });
      }
    });
  }
  redirectAfterReception() {
    const token = localStorage.getItem('token');
    if (token) {
      const jwtHelper = new JwtHelperService();
      const decodedToken = jwtHelper.decodeToken(token);
      const role = decodedToken.role.replace('ROLE_', '').toUpperCase();
  
      if (role === "GESTIONNAIRE_STOCK") {
        this.router.navigate(['/reception-vehicules-mobile']);
      } else {
        this.router.navigate(['/vehicules']);
      }
    } else {
      this.router.navigate(['/vehicules']);
    }
  }
  enregistrerVehicule() {
    console.warn("📋 Formulaire actuel :", this.form.value);
  
    if (this.form.invalid) {
      this.snackBar.open('🚨 Formulaire invalide', 'Fermer', { duration: 3000 });
      return;
    }
  
    const formData = new FormData();
  
    formData.append('numeroChassis', this.form.value.numeroChassis);
    formData.append('parcId', this.parcId?.toString() ?? '1');
  
    // ✅ Ajouter la liste d’avaries (sous forme de JSON)
    const avariesFormatees = this.avariesConfirmees.map((av, index) => ({
      type: av.type,
      commentaire: av.commentaire,
      key: av.key || `av${index}` // 🔑 assure une clé unique pour relier aux photos
    }));
    formData.append('avarie', JSON.stringify(avariesFormatees));
  
    // ✅ Ajouter les photos avec nom incluant la clé d’avarie (photo-avX-filename)
    avariesFormatees.forEach(avarie => {
      const photos = this.photosParAvarie[avarie.key] || []; // 📸 photos associées à chaque avarie
      if (!photos.length) {
        console.warn(`⚠️ Aucune photo trouvée pour la clé ${avarie.key}`);
      }
      photos.forEach((file: File, i: number) => {
        const fileName = `photo-${avarie.key}-${i}.png`;
        formData.append('photos', file, fileName);
      });
    });
  
    // ✅ Appel backend
    this.http.post(
      'http://localhost:8080/api/vehicules/reception',
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
        
        this.redirectAfterReception();
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
