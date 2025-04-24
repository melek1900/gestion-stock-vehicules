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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
export interface SousParc {
  id: number;
  nom: string;
  parcId: number;
}

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
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule,
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
  chauffeursSelectionnes: string[] = [];
  vehiculeTransportSelectionne: string | null = null;

  userParc: string | null = null;
  userRole: string | null = null;
  searchQuery: string = '';

  modeSelection: 'selection_initiale' | 'ajout_vehicules' = 'ajout_vehicules';
  selection = new SelectionModel<any>(true, []);
  dateDepart: Date = new Date();
  motifs: any[] = [];
  motifSelectionne: number | null = null;
  heureDepart: string = '';
  heuresDisponibles: string[] = [];
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  sousParcs: any[] = [];
  sousParcSelectionne: string | null = null;
  
  ngOnInit(): void {
    this.recupererRoleUtilisateur();
    this.http.get<any[]>('http://localhost:8080/api/motifs').subscribe(data => {
      this.motifs = data;
    });
    this.heuresDisponibles = Array.from({ length: 10 }, (_, i) => {
      const heure = i + 8;
      return `${heure.toString().padStart(2, '0')}:00`;
    });
    this.route.queryParams.subscribe(params => {
      if (params['vehicules']) {
        this.modeSelection = 'selection_initiale';
        this.recupererVehiculesSelectionnes(params['vehicules']);
      } else {
        this.modeSelection = 'ajout_vehicules';
        this.vehiculesSelectionnes = [];
        this.chargerTousVehicules();
      }
    });
  
    this.chargerParcs();
    this.chargerChauffeurs();
    this.chargerVehiculesTransport();
  }

  isAllSelected(): boolean {
    return this.selection.selected.length === this.vehiculesFiltres.length;
  }
  onParcDestinationChange(parcId: string) {
    console.log("🚩 Parc sélectionné :", parcId); // DEBUG
  
    this.parcDestination = parcId;
  
    this.http.get<any>(`http://localhost:8080/api/parcs/${parcId}`).subscribe(parc => {
      console.log("ℹ️ Parc reçu :", parc); // DEBUG
  
      if (parc.nom === 'CARROSSERIE') {
        this.http.get<SousParc[]>(`http://localhost:8080/api/sous-parcs/parc/${parcId}`).subscribe(data => {
          console.log("✅ Sous-parcs reçus :", data); // DEBUG
          this.sousParcs = data;
        });
      } else {
        this.sousParcs = [];
        this.sousParcSelectionne = null;
      }
    });
  }
  
  toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.vehiculesFiltres.forEach(v => this.selection.select(v));
    }
  }
  verifierVehiculeUtilise(vehiculeId: number): Promise<boolean> {
    return this.http.get<boolean>(`http://localhost:8080/api/ordres-mission/vehicule/${vehiculeId}/en-utilisation`)
      .toPromise()
      .then(result => result ?? false)
      .catch(err => {
        console.error(`Erreur vérif véhicule ${vehiculeId}`, err);
        return false;
      });
  }
  
  chargerTousVehicules() {
    this.http.get<any[]>('http://localhost:8080/api/vehicules').subscribe(data => {
      const vehiculesPromises = data.map(v =>
        this.http.get<boolean>(`http://localhost:8080/api/ordres-mission/vehicule/${v.id}/en-utilisation`).toPromise().then(enUtilisation => {
          return { ...v, enUtilisation };
        })
      );
  
      Promise.all(vehiculesPromises).then(resultats => {
        this.vehicules = resultats.map(v => ({
          ...v,
          parcId: v.parcId ?? v.parc?.id
        })).filter(v =>
          !v.enUtilisation &&
          v.parcNom === this.userParc &&
          !['VENDU', 'RESERVE', 'LIVREE'].includes(v.statut)
        );
      });
    });
  }
  
  mettreAJourVehiculesSelectionnes() {
    this.vehiculesSelectionnes = this.selection.selected;
  }

  recupererVehiculesSelectionnes(vehiculesIds: string) {
    const ids = vehiculesIds.split(',').map(id => parseInt(id, 10));
    this.http.get<any[]>('http://localhost:8080/api/vehicules')
      .subscribe(data => {
        this.vehiculesSelectionnes = data.filter(v => ids.includes(v.id)).map(v => ({
          ...v,
          parcId: v.parcId ?? v.parc?.id // <-- s'il vient d'un objet imbriqué
        }));        this.vehicules = data.filter(v => !ids.includes(v.id));
        this.vehiculesFiltres = [];
      });
  }

  async rechercherVehicule() {
    const query = this.searchQuery.trim().toLowerCase();
  
    if (!query) {
      this.vehiculesFiltres = [];
      return;
    }
  
    const vehiculesDisponibles = this.vehicules.filter(v =>
      v.numeroChassis.toLowerCase().includes(query) &&
      !this.vehiculesSelectionnes.some(sel => sel.id === v.id) &&
      v.statut !== 'VENDU' && v.statut !== 'RESERVE' && v.statut !== 'LIVREE' &&
      v.parcNom === this.userParc
    );
  
    const verifications = await Promise.all(
      vehiculesDisponibles.map(v =>
        this.verifierVehiculeUtilise(v.id).then(utilise => ({ vehicule: v, utilise }))
      )
    );
  
    this.vehiculesFiltres = verifications
      .filter(result => !result.utilise)
      .map(result => result.vehicule);
  }
  

  supprimerVehiculeSelectionne(vehicule: any) {
    this.vehiculesSelectionnes = this.vehiculesSelectionnes.filter(v => v.id !== vehicule.id);
  
    const query = this.searchQuery.trim().toLowerCase();
    if (query && vehicule.numeroChassis.toLowerCase().includes(query)) {
      if (!this.vehiculesFiltres.some(v => v.id === vehicule.id)) {
        this.vehiculesFiltres.push(vehicule);
      }
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
      console.log("👤 Role:", this.userRole, "📍 Parc:", this.userParc);
    }
  }
  

  chargerParcs() {
    this.http.get<any[]>('http://localhost:8080/api/parcs').subscribe(data => {
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

    this.http.get<any[]>('http://localhost:8080/api/chauffeurs/disponibles', { headers })
      .subscribe(data => {
        this.chauffeurs = data.filter(chauffeur => chauffeur.disponible);
      });
  }

  chargerVehiculesTransport() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    });

    this.http.get<any[]>('http://localhost:8080/api/vehicules-transport/disponibles', { headers })
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
    // Méthode de filtre pour désactiver les dates antérieures à aujourd'hui
    filterDates = (date: Date | null): boolean => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Ignore l'heure
      return date ? date >= today : false;
    };

  async initierTransfert() {
    if (!this.chauffeursSelectionnes || !this.vehiculeTransportSelectionne || this.vehiculesSelectionnes.length === 0) {
      return;
    }
  
    // Vérification d’unicité pour chaque véhicule
    for (const vehicule of this.vehiculesSelectionnes) {
      const enUtilisation = await this.verifierVehiculeUtilise(vehicule.id);
      if (enUtilisation) {
        alert(`❌ Le véhicule ${vehicule.numeroChassis} est déjà utilisé dans un autre ordre mission non clôturé.`);
        return;
      }
    }
    if (!this.dateDepart || !this.heureDepart || !this.motifSelectionne) {
      alert('Veuillez remplir la date, l’heure et le motif de déplacement.');
      return;
    }
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });
  
    const payload = {
      vehiculeIds: this.vehiculesSelectionnes.map(v => v.id),
      chauffeurIds: this.chauffeursSelectionnes.map(id => parseInt(id, 10)),
      vehiculeTransportId: parseInt(this.vehiculeTransportSelectionne ?? '0', 10),
      parcDepartId: this.vehiculesSelectionnes[0]?.parcId || 0,
      parcArriveeId: this.parcDestination ? parseInt(this.parcDestination, 10) : 0,
      utilisateurId: this.getUtilisateurIdFromToken() ?? 0,
      dateDepart: this.dateDepart?.toISOString().split('T')[0],
      heureDepart: this.heureDepart,
      motifDeplacementId: this.motifSelectionne,
      sousParcId: this.sousParcSelectionne ? parseInt(this.sousParcSelectionne, 10) : null,

    };
    
    this.http.post<{ ordreMissionId: number, numeroOrdre: string, pdfUrl: string }>(
      'http://localhost:8080/api/ordres-mission/creer',
      payload,
      { headers }
    ).subscribe(response => {
      const token = localStorage.getItem('token');
      const pdfUrlComplet = `http://localhost:8080${response.pdfUrl}`;
    
      this.http.get(pdfUrlComplet, {
        headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }),
        responseType: 'blob'
      }).subscribe(file => {
        const blob = new Blob([file], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
    
        const link = document.createElement('a');
        link.href = url;
        link.download = `${response.numeroOrdre}.pdf`;
        link.click();
        setTimeout(() => window.URL.revokeObjectURL(url), 2000);
    
        this.router.navigate(['/ordre-mission']);
      });
    });
  }
}
