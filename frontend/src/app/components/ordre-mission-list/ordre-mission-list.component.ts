import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { PopupTransfertComponent } from '../popup-transfert/popup-transfert.component';

@Component({
  selector: 'app-ordre-mission-list',
  templateUrl: './ordre-mission-list.component.html',
  styleUrls: ['./ordre-mission-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatInputModule,
    MatPaginatorModule,
    MatIconModule,
    MatMenuModule 
  ]
})
export class OrdreMissionListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

dataSource = new MatTableDataSource<any>([]);
  ordresMission: any[] = [];
  displayedColumns: string[] = [
    'numeroMission', 'date', 'chauffeur', 'vehicule', 'parcDepart', 'parcArrivee', 'statut', 'actions'
  ];  private http = inject(HttpClient);
  private snackBar = inject(MatSnackBar);
  statutFiltre: string = ''; 
  ordresMissionFiltres: any[] = []; 
  recherche: string = '';  
  constructor(private dialog: MatDialog) {}

  ouvrirPopupTransfert(ordre: any) {
    this.dialog.open(PopupTransfertComponent, {
      width: '600px',
      data: ordre
    }).afterClosed().subscribe((result) => {
      if (result?.ordreCloture) {
        ordre.statut = 'CLOTURE'; // ✅ Mise à jour du statut dans le tableau
        this.snackBar.open('✅ Ordre de mission clôturé automatiquement !', 'Fermer', {
          duration: 3000
        });
      }
    });
  }
  
  filtrerOrdres() {
    const rechercheLower = this.recherche.trim().toLowerCase();
  
    this.ordresMissionFiltres = this.ordresMission.filter(ordre => {
      const statutMatch = this.statutFiltre ? ordre.statut === this.statutFiltre : true;
  
      const numeroMatch = ordre.numeroOrdre?.toLowerCase().includes(rechercheLower);
  
      const chauffeurMatch =
    ordre.chauffeurs?.some((ch: { nom?: string; prenom?: string }) =>
    ch.nom?.toLowerCase().includes(rechercheLower) || ch.prenom?.toLowerCase().includes(rechercheLower)
  );

  
      const vehiculeMatch =
        ordre.vehiculeTransport?.matricule?.toLowerCase().includes(rechercheLower) ||
        ordre.vehiculeTransport?.type?.toLowerCase().includes(rechercheLower);
  
      let dateMatch = false;
      if (ordre.dateCreation instanceof Date && !isNaN(ordre.dateCreation)) {
        const formattedDate = new Intl.DateTimeFormat('fr-FR').format(ordre.dateCreation);
        dateMatch = formattedDate.toLowerCase().includes(rechercheLower);
      }
  
      const rechercheMatch = !rechercheLower || numeroMatch || chauffeurMatch || vehiculeMatch || dateMatch;
  
      return statutMatch && rechercheMatch;
    });
    this.dataSource.data = this.ordresMissionFiltres;

    this.paginator.firstPage?.();
  }
  
  ngOnInit() {
    this.chargerOrdresMission();
    console.log("🧾 Ordres mission chargés :", this.ordresMission);

  }

  /** 🔄 Charger la liste des ordres de mission */
  chargerOrdresMission() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
  
    this.http.get<any[]>('http://localhost:8080/api/ordres-mission', { headers }).subscribe({
      next: (data) => {
        this.ordresMission = data.map(ordre => ({
          ...ordre,
          dateCreation: new Date(ordre.dateCreation),
          pdfUrl: `http://localhost:8080/api/ordres-mission/${ordre.id}/pdf`
        }));
        this.dataSource.data = this.ordresMission;
        this.ordresMissionFiltres = this.ordresMission;
      },
      error: () => {
        this.snackBar.open('❌ Erreur lors du chargement des ordres de mission', 'Fermer', { duration: 3000 });
      },
    });
  }
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
  annulerOrdreMission(ordreId: number) {
    if (!confirm('⚠️ Confirmer l\'annulation de cet ordre de mission ?')) return;
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
  
    this.http.put(`http://localhost:8080/api/ordres-mission/annuler/${ordreId}`, {}, { headers }).subscribe({
      next: () => {
        this.snackBar.open('✅ Ordre de mission annulé avec succès', 'Fermer', { duration: 3000 });
        this.chargerOrdresMission(); // 🔄 Refresh
      },
      error: () => {
        this.snackBar.open('❌ Échec de l\'annulation de l\'ordre', 'Fermer', { duration: 3000 });
      }
    });
  }
  telechargerOrdreMission(pdfUrl: string, numeroOrdre: string) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
  
    this.http.get(pdfUrl, { headers, responseType: 'blob' }).subscribe({
      next: (blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `${numeroOrdre}.pdf`;
        link.click();
      },
      error: () => {
        this.snackBar.open('❌ Erreur lors du téléchargement du document', 'Fermer', { duration: 3000 });
      }
    });
  }
  
}
