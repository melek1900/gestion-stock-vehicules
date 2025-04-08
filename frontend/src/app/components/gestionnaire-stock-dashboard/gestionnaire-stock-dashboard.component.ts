import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger
} from '@angular/animations';
@Component({
  selector: 'app-gestionnaire-stock-dashboard',
  imports: [MatIconModule],
  templateUrl: './gestionnaire-stock-dashboard.component.html',
  styleUrl: './gestionnaire-stock-dashboard.component.scss'
})
export class GestionnaireStockDashboardComponent {
  constructor(private router: Router) {}

  naviguerVersReception() {
    this.router.navigate(['/reception-vehicules-mobile']);
  }
  naviguerVersAvarie() {
    this.router.navigate(['/creer-avarie']);
  }
  
  naviguerVersImport() {
    this.router.navigate(['/import-vehicules']);
  }

  naviguerVersPrelevementLivraison() {
    this.router.navigate(['/prelevement-vehicule-mobile']);
  }
  naviguerVersOrdresMissions(){
    this.router.navigate(['/ordre-mission-mobile']);
  }
  naviguerVersListeAvarie(){
    this.router.navigate(['/avarie-list-mobile']);
  }
}
