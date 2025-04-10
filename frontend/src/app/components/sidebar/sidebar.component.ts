import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [NgIf, MatIconModule,RouterModule],
})
export class SidebarComponent {
  stockMenuOpen = false;
  CompteurOpen=false;
  ordreMissionMenuOpen = false;
  adminMenuOpen = false;
  parametresMenuOpen = false;
  parametresConstatOpen = false;
  isSidebarOpen = true; // Pour responsive mobile
  userRole: string = '';
  constructor() {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.userRole = payload.role;
    }
  }
  
  toggleCompteurMenu() {
    this.CompteurOpen = !this.CompteurOpen;
  }
  toggleStockMenu() {
    this.stockMenuOpen = !this.stockMenuOpen;
  }
  toggleOrdreMissionMenu() {
    this.ordreMissionMenuOpen = !this.ordreMissionMenuOpen;
  }
  toggleAdminMenu() {
    this.adminMenuOpen = !this.adminMenuOpen;
  }

  toggleParametresMenu() {
    this.parametresMenuOpen = !this.parametresMenuOpen;
  }
  toggleConstatMenu() {
    this.parametresConstatOpen = !this.parametresConstatOpen;
  }
}
