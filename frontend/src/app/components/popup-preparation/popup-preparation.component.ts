import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { HttpClient } from '@angular/common/http'; // ✅ Ajout du HttpClient

@Component({
  selector: 'app-popup-preparation',
  templateUrl: './popup-preparation.component.html',
  styleUrls: ['./popup-preparation.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule,
    MatCardModule
  ],
})
export class PopupPreparationComponent {
  preparationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient, // ✅ Correction de l'injection du HttpClient
    public dialogRef: MatDialogRef<PopupPreparationComponent>, // ✅ Injection du DialogRef
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.preparationForm = this.fb.group({
      nettoyage: [false, Validators.required], // ✅ Valeur par défaut : false
      inspection: [false, Validators.required],
      remarques: ['']
    });
  }

  validerPreparation() {
    if (this.preparationForm.valid) {
      const token = localStorage.getItem('token'); // 🔑 Récupération du token
      if (!token) {
        console.error("❌ Aucun token trouvé !");
        return;
      }
  
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
  
      this.http.post('http://localhost:8080/api/vehicules/preparation', {
        vehiculeId: this.data.vehicule.id,
        nettoyageEffectue: this.preparationForm.value.nettoyage,
        inspectionEffectuee: this.preparationForm.value.inspection,
        remarques: this.preparationForm.value.remarques
      }, { headers }) // ✅ Ajout du token dans la requête
      .subscribe({
        next: () => {
          console.log('✅ Préparation mise à jour avec succès !');
          this.dialogRef.close({ action: 'update', data: this.preparationForm.value });
        },
        error: (err) => {
          console.error('❌ Erreur lors de la mise à jour de la préparation :', err);
        }
      });
    }
  }
  
}
