import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MarquePopupComponent } from '../marque-popup/marque-popup.component';

@Component({
  selector: 'app-marque-liste',
  standalone: true,
  templateUrl: './marque-liste.component.html',
  styleUrl: './marque-liste.component.scss',
  imports: [
    CommonModule, MatMenuModule, MatIconModule,
    MatFormFieldModule, FormsModule,
    MatTableModule, MatInputModule, NgIf
  ]
})
export class MarqueListeComponent implements OnInit {
  displayedColumns: string[] = ['nom', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  marques: any[] = [];
  marquesFiltres: any[] = [];
  searchQuery = '';
  selection = new SelectionModel<any>(true, []);

  private http = inject(HttpClient);
  private dialog = inject(MatDialog);

  ngOnInit(): void {
    this.chargerMarques();
  }

  chargerMarques() {
    this.http.get<any[]>('http://localhost:8080/api/marques').subscribe(data => {
      this.marques = data;
      this.filtrerMarques();
    });
  }

  filtrerMarques() {
    const query = this.searchQuery?.trim().toLowerCase() || '';
    this.marquesFiltres = this.marques.filter(m =>
      m.nom?.toLowerCase().includes(query)
    );
    this.dataSource.data = this.marquesFiltres;
    if (this.paginator) this.paginator.firstPage();
  }

  ouvrirPopup(marque: any = null) {
    const dialogRef = this.dialog.open(MarquePopupComponent, {
      width: '400px',
      data: { marque }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'add') {
        this.http.post('http://localhost:8080/api/marques', result.data).subscribe(() => this.chargerMarques());
      }
    });
  }

  ajouterMarque() {
    this.ouvrirPopup();
  }

  supprimerMarque(id: number, nom: string) {
    const confirmation = confirm(`Voulez-vous vraiment supprimer la marque "${nom}" ?`);
    if (confirmation) {
      this.http.delete(`http://localhost:8080/api/marques/${id}`).subscribe(() => {
        this.chargerMarques();
      });
    }
  }

  isAllSelected(): boolean {
    return this.selection.selected.length === this.marques.length;
  }

  toggleAllRows() {
    if (this.isAllSelected()) this.selection.clear();
    else this.marques.forEach(m => this.selection.select(m));
  }
}