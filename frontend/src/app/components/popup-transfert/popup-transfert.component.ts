import { Component, Inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-popup-transfert',
  standalone: true,
  templateUrl: './popup-transfert.component.html',
  styleUrls: ['./popup-transfert.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule
  ]
})
export class PopupTransfertComponent {
  sousParcsCarrosserie: any[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private http: HttpClient,
    private dialogRef: MatDialogRef<PopupTransfertComponent>,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.http.get<any[]>('http://localhost:8080/api/sous-parcs/by-parc-nom/CARROSSERIE').subscribe({
      next: (data) => this.sousParcsCarrosserie = data,
      error: () => this.snackBar.open('❌ Erreur chargement sous-parcs', 'Fermer', { duration: 3000 })
    });
  }

  validerTransfert(vehicule: any) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
  
    const sousParcId = this.data.sousParc?.id;
    if (!sousParcId) {
      alert("❌ Aucun sous-parc défini pour cet ordre de mission !");
      return;
    }
  
    this.http.patch(`http://localhost:8080/api/vehicules/${vehicule.numeroChassis}/transfert-carrosserie`, {
      sousParcId
    }, { headers }).subscribe({
      next: () => {
        vehicule.transfere = true;
      },
      error: () => alert('❌ Erreur lors du transfert')
    });
  }
}
