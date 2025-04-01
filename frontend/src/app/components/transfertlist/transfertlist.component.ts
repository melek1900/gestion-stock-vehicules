import { Component, OnInit, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-transfert-list',
  templateUrl: './transfertList.component.html',
  styleUrls: ['./transfertlist.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDividerModule
  ]
})
export class TransfertListComponent implements OnInit {
  vehiculesSelectionnes: any[] = [];
  parcs: any[] = [];
  chauffeurs: any[] = [];
  vehiculesTransport: any[] = [];
  vehicules: any[] = [];
  vehiculesFiltres: any[] = [];

  displayedColumns: string[] = ['select', 'shortDescription', 'numeroChassis', 'shortColor', 'parcNom', 'actions'];
  selectedParc: string = 'all';
  selectedStatut: string = 'all';

  parcDestination: string | null = null;
  chauffeurSelectionne: string | null = null;
  vehiculeTransportSelectionne: string | null = null;

  userParc: string | null = null;
  userRole: string | null = null;
  searchQuery: string = '';

  modeSelection: 'selection_initiale' | 'ajout_vehicules' = 'ajout_vehicules';
  selection = new SelectionModel<any>(true, []);

  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.recupererRoleUtilisateur();

    this.route.queryParams.subscribe(params => {
      if (params['vehicules']) {
        this.modeSelection = 'selection_initiale';
        this.recupererVehiculesSelectionnes(params['vehicules']);
      } else {
        this.modeSelection = 'ajout_vehicules';
        this.vehiculesSelectionnes = [];
      }
    });

    this.chargerParcs();
    this.chargerChauffeurs();
    this.chargerVehiculesTransport();
  }

  isAllSelected(): boolean {
    return this.selection.selected.length === this.vehiculesFiltres.length;
  }

  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.vehiculesFiltres.forEach(v => this.selection.select(v));
    }
  }

  mettreAJourVehiculesSelectionnes() {
    this.vehiculesSelectionnes = this.selection.selected;
  }

  recupererVehiculesSelectionnes(vehiculesIds: string) {
    const ids = vehiculesIds.split(',').map(id => parseInt(id, 10));
    this.http.get<any[]>('http://172.20.10.8:8080/api/vehicules')
      .subscribe(data => {
        this.vehiculesSelectionnes = data.filter(v => ids.includes(v.id));
        this.vehicules = data.filter(v => !ids.includes(v.id));
        this.vehiculesFiltres = [];
      });
  }

  rechercherVehicule() {
    if (!this.searchQuery.trim()) {
      this.vehiculesFiltres = [];
      return;
    }

    this.http.get<any[]>('http://172.20.10.8:8080/api/vehicules')
      .subscribe(data => {
        this.vehicules = data;
        this.vehiculesFiltres = data.filter(v =>
          v.numeroChassis.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
          !this.vehiculesSelectionnes.some(sel => sel.id === v.id) &&
          v.statut !== 'AVARIE' &&
          v.statut !== 'VENDU' &&
          v.statut !== 'RESERVE' &&
          v.statut !== 'LIVREE' &&
          v.parcNom === this.userParc
        );
      });
  }

  supprimerVehiculeSelectionne(vehicule: any) {
    this.vehiculesSelectionnes = this.vehiculesSelectionnes.filter(v => v.id !== vehicule.id);
    if (this.searchQuery.trim() && vehicule.numeroChassis.toLowerCase().includes(this.searchQuery.toLowerCase())) {
      if (!this.vehiculesFiltres.some(v => v.id === vehicule.id)) {
        this.vehiculesFiltres.push(vehicule);
      }
    }

    if (!this.searchQuery.trim()) {
      this.vehiculesFiltres = [];
    }
  }

  ajouterVehiculesSelectionnes() {
    if (this.selection.selected.length === 0) return;
  
    this.vehiculesSelectionnes = [...this.vehiculesSelectionnes, ...this.selection.selected];
    this.vehiculesFiltres = this.vehiculesFiltres.filter(v => !this.vehiculesSelectionnes.some(sel => sel.id === v.id));
    this.selection.clear();
  
    this.searchQuery = '';
  
    this.vehiculesFiltres = [];
  }

  recupererRoleUtilisateur() {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userRole = payload.role;
      this.userParc = payload.parcNom || null;
    }
  }

  chargerParcs() {
    this.http.get<any[]>('http://172.20.10.8:8080/api/parcs').subscribe(data => {
      if (this.vehiculesSelectionnes.length > 0) {
        const parcActuel = this.vehiculesSelectionnes[0].parcNom;
        this.parcs = data.filter(parc =>
          parc.nom !== 'AUPORT' && parc.nom !== 'TRANSFERT' && parc.nom !== parcActuel
        );
      } else {
        this.parcs = data.filter(parc => parc.nom !== 'AUPORT');
      }
    });
  }

  chargerChauffeurs() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    this.http.get<any[]>('http://172.20.10.8:8080/api/chauffeurs/disponibles', { headers })
      .subscribe(data => {
        this.chauffeurs = data.filter(chauffeur => chauffeur.disponible);
      });
  }

  chargerVehiculesTransport() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    this.http.get<any[]>('http://172.20.10.8:8080/api/vehicules-transport/disponibles', { headers })
      .subscribe(data => {
        this.vehiculesTransport = data.filter(vehicule => vehicule.disponible);
      });
  }

  getUtilisateurIdFromToken(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || null;
  }

  initierTransfert() {
    if (!this.chauffeurSelectionne || !this.vehiculeTransportSelectionne || this.vehiculesSelectionnes.length === 0) {
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });

    const payload = {
      vehiculeIds: this.vehiculesSelectionnes.map(v => v.id),
      chauffeurId: parseInt(this.chauffeurSelectionne ?? '0', 10),
      vehiculeTransportId: parseInt(this.vehiculeTransportSelectionne ?? '0', 10),
      parcDepartId: this.vehiculesSelectionnes[0]?.parcId || 0,
      parcArriveeId: this.parcDestination ? parseInt(this.parcDestination, 10) : 0,
      utilisateurId: this.getUtilisateurIdFromToken() ?? 0
    };

    this.http.post<{ ordreMissionId: number, pdfUrl: string }>('http://172.20.10.8:8080/api/ordres-mission/creer', payload, { headers })
      .subscribe(response => {
        const token = localStorage.getItem('token');
        const pdfUrlComplet = `http://172.20.10.8:8080${response.pdfUrl}`;
        this.http.get(pdfUrlComplet, {
          headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }),
          responseType: 'blob'
        }).subscribe(file => {
          const blob = new Blob([file], { type: 'application/pdf' });
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        });
      });
  }
}
