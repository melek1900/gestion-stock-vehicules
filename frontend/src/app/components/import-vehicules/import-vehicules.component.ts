import { Component } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-import-vehicules',
  standalone: true,
  templateUrl: './import-vehicules.component.html',
  styleUrl: './import-vehicules.component.scss',
  imports: [ CommonModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressBarModule],
})
export class ImportVehiculesComponent {
  selectedFile: File | null = null;
  selectedFileName: string = '';
  isUploading = false;
  importStatus: string = '';
  isSuccess = false;
  isGestionnaire = false;

  constructor(private http: HttpClient, private snackBar: MatSnackBar) {
    const token = localStorage.getItem('token');
    if (token) {
      const helper = new JwtHelperService();
      const decoded = helper.decodeToken(token);
      this.isGestionnaire = decoded.role === 'ROLE_GESTIONNAIRE_STOCK';
    }
  }
  
    // ✅ Sélection d'un fichier
    onFileSelected(event: any) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
        this.selectedFileName = file.name;
        this.importStatus = ''; // Réinitialise le statut
      }
    }

    // ✅ Envoi du fichier au backend
    uploadFile() {
      if (!this.selectedFile) {
        this.snackBar.open('Veuillez sélectionner un fichier avant d’importer.', 'Fermer', { duration: 3000 });
        return;
      }  
      this.isUploading = true;
      const formData = new FormData();
      formData.append('file', this.selectedFile);
  
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('token')}` // Ajoute le token si nécessaire
      });
      this.http.post<{ message: string; status: string }>('http://localhost:8080/api/vehicules/import-excel', formData, { headers })
      .subscribe({
        next: (response) => {
          this.importStatus = response.message;
          this.isSuccess = response.status === "success";
          this.isUploading = false;
          this.snackBar.open(this.importStatus, 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erreur importation :', error);
          this.importStatus = "❌ Erreur lors de l’importation";
          this.isSuccess = false;
          this.isUploading = false;
          this.snackBar.open(this.importStatus, 'Fermer', { duration: 3000 });
        }
            });
  }
}
