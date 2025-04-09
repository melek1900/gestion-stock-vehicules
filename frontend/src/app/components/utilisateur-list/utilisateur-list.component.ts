// utilisateur-list.component.ts
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { PopupUtilisateurComponent } from '../popup-utilisateur/popup-utilisateur.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-utilisateur-list',
  templateUrl: './utilisateur-list.component.html',
  styleUrls: ['./utilisateur-list.component.scss'],
  standalone: true,
  imports: [MatMenuModule, MatIconModule,MatFormFieldModule,FormsModule,MatPaginatorModule,MatTableModule,NgIf,MatInputModule]
})
export class UtilisateurListComponent implements OnInit {
  displayedColumns: string[] = ['nom', 'prenom', 'email', 'role', 'parcsAccessibles', 'marquesAccessibles', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  utilisateurs: any[] = [];
  utilisateursFiltres: any[] = [];
  searchQuery = '';
  selection = new SelectionModel<any>(true, []);

  private http = inject(HttpClient);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.chargerUtilisateurs();
  }

  chargerUtilisateurs() {
    this.http.get<any[]>('http://192.168.1.121:8080/api/utilisateurs').subscribe(data => {
      this.utilisateurs = data;
      this.filtrerUtilisateurs();
    });
  }
  formatRole(role: string): string {
    switch (role) {
      case 'ROLE_Administrateur': return 'Administration';
      case 'ROLE_GESTIONNAIRE_STOCK': return 'Gestionnaire Stock';
      case 'ROLE_Manager': return 'Manager';
      case 'ROLE_EXPERT': return 'Expert';
      case 'ROLE_Commercial': return 'Commercial';
      default: return role;
    }
  }
  filtrerUtilisateurs() {
    const query = this.searchQuery?.trim().toLowerCase() || '';
    this.utilisateursFiltres = this.utilisateurs.filter(user =>
      user.nom?.toLowerCase().includes(query) ||
      user.prenom?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
    this.dataSource.data = this.utilisateursFiltres;
    if (this.paginator) this.paginator.firstPage();
  }

  ouvrirPopup(user: any) {
    const dialogRef = this.dialog.open(PopupUtilisateurComponent, {
      width: '600px',
      data: {
        utilisateur: user,
        parcsDisponibles: this.extractParcsDisponibles()
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'update') {
        const utilisateurModifie = result.data;
  
        this.http.put(`http://192.168.1.121:8080/api/utilisateurs/${utilisateurModifie.id}`, utilisateurModifie)
          .subscribe(() => {
            this.chargerUtilisateurs(); // recharge la liste
          });
      }
  
      if (result?.action === 'delete') {
        this.supprimerUtilisateur(result.data.id);
      }
    });
  }
  extractParcsDisponibles(): any[] {
    const parcs = new Set<string>();
    this.utilisateurs.forEach(u => u.parcsAccessibles?.forEach((p: string) => parcs.add(p)));
    return Array.from(parcs).map(nom => ({ nom }));
  }
  
  ajouterUtilisateur() {
    const dialogRef = this.dialog.open(PopupUtilisateurComponent, {
      width: '600px',
      data: {
        parcsDisponibles: this.extractParcsDisponibles()
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'update') {
        const nouvelUtilisateur = result.data;
  
        this.http.post('http://192.168.1.121:8080/api/utilisateurs', nouvelUtilisateur)
          .subscribe(() => {
            this.chargerUtilisateurs(); // recharge la liste
          });
      }
    });
  }
  supprimerUtilisateur(id: number) {
    this.http.delete(`http://192.168.1.121:8080/api/utilisateurs/${id}`).subscribe(() => {
      this.chargerUtilisateurs();
    });
  }
  isAllSelected(): boolean {
    return this.selection.selected.length === this.utilisateurs.length;
  }

  toggleAllRows() {
    if (this.isAllSelected()) this.selection.clear();
    else this.utilisateurs.forEach(u => this.selection.select(u));
  }
}
