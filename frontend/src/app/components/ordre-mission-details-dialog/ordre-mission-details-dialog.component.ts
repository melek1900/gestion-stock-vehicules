import { CommonModule, NgFor } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ordre-mission-details-dialog',
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule, MatCardModule, MatChipsModule, NgFor],
  templateUrl: './ordre-mission-details-dialog.component.html',
  styleUrl: './ordre-mission-details-dialog.component.scss'
})
export class OrdreMissionDetailsDialogComponent {
  
  constructor(
    public dialogRef: MatDialogRef<OrdreMissionDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    console.log("📦 Données véhicules reçues :", this.data.vehicules);
  
    // ✅ Marquer les véhicules comme prélevés si parc.id === 3 (TRANSFERT)
    this.data.vehicules = this.data.vehicules.map((v: any) => ({
      ...v,
      preleve: v.parcId === 3
    }));
  
    // ✅ Trier : Non prélevés en premier
    this.data.vehicules = this.data.vehicules.sort((a: any, b: any) => {
      return Number(a.preleve) - Number(b.preleve); // false (0) avant true (1)
    });
  }

  fermer() {
    this.dialogRef.close();
  }
}
