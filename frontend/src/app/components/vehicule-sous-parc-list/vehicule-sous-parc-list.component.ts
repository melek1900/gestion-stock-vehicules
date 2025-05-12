import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { Vehicule } from '../../models/vehicule.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-vehicule-sous-parc',
  templateUrl:'./vehicule-sous-parc-list.component.html',
  styleUrls: ['./vehicule-sous-parc-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatInputModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatButtonToggleModule,
    MatPaginatorModule,
    MatMenuModule
  ]
})
export class VehiculeSousParcListComponent implements OnInit {
  vehicules: Vehicule[] = [];
  dataSource = new MatTableDataSource<Vehicule>();
  selection = new SelectionModel<Vehicule>(true, []);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['select', 'numeroChassis', 'shortDescription', 'modele', 'shortColor', 'statut'];
  searchQuery: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.chargerVehiculesParSousParc('CARROSSERIE'); // 🔁 Nom du sous-parc ici
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  chargerVehiculesParSousParc(nomSousParc: string) {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.get<Vehicule[]>(`http://localhost:8080/api/vehicules/sous-parc/${nomSousParc}`, { headers })
      .subscribe({
        next: (vehicules) => {
          this.vehicules = vehicules;
          this.dataSource.data = vehicules;
        },
        error: (err) => console.error('❌ Erreur chargement véhicules sous-parc:', err)
      });
  }

  filtrer() {
    const filtre = this.searchQuery.trim().toLowerCase();
    this.dataSource.data = this.vehicules.filter(v =>
      v.numeroChassis?.toLowerCase().includes(filtre) ||
      v.shortDescription?.toLowerCase().includes(filtre) ||
      v.shortColor?.toLowerCase().includes(filtre) ||
      v.modele?.toLowerCase().includes(filtre)
    );
  }

  isAllSelected() {
    return this.selection.selected.length === this.dataSource.data.length;
  }

  toggleAllRows() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach(row => this.selection.select(row));
  }
}
