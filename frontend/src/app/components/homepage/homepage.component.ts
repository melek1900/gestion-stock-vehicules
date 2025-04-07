import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { JwtHelperService } from '@auth0/angular-jwt';
import { DashboardStatistiquesComponent } from '../dashboard-statistiques/dashboard-statistiques.component';
import { GestionnaireStockDashboardComponent } from '../gestionnaire-stock-dashboard/gestionnaire-stock-dashboard.component';
import { VehiculeListComponent } from '../vehicule-list/vehicule-list.component';
import { ReparationComponent } from '../reparation/reparation.component';
import { UtilisateurListComponent } from "../utilisateur-list/utilisateur-list.component";


@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    NgIf,
    DashboardStatistiquesComponent,
    GestionnaireStockDashboardComponent,
    VehiculeListComponent,
    ReparationComponent,
    UtilisateurListComponent,
    UtilisateurListComponent
],
})
export class HomepageComponent {
  prenom: string = '';
  nom: string = '';
  role: string = '';

  constructor() {
    const token = localStorage.getItem('token');
    if (token) {
      const jwtHelper = new JwtHelperService();
      const decodedToken = jwtHelper.decodeToken(token);
      this.prenom = decodedToken.prenom;
      this.nom = decodedToken.nom;
      this.role = decodedToken.role.replace('ROLE_', '');
      console.log('🎯 Role décodé :', this.role);
    }
  }
}
