import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PopupSousParcComponent } from '../popup-sous-parc/popup-sous-parc.component';
import { SousParcService, SousParc } from '../../../services/sous-parc.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-sous-parc-list',
  imports: [MatIconModule,MatTableModule,MatCardModule,MatDivider],
  templateUrl: './sous-parc-list.component.html',
  styleUrl: './sous-parc-list.component.scss'
})
export class SousParcListComponent {
  sousParcs: SousParc[] = [];
  displayedColumns: string[] = ['nom', 'actions'];

  constructor(
    private sousParcService: SousParcService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadSousParcs();
  }

  loadSousParcs(): void {
    this.sousParcService.getAll().subscribe(data => this.sousParcs = data);
  }

  openAddDialog(): void {
    const dialogRef = this.dialog.open(PopupSousParcComponent, { width: '300px' });
    dialogRef.afterClosed().subscribe(result => {
      if (result) this.loadSousParcs();
    });
  }

  deleteSousParc(id: number): void {
    if (confirm('Confirmer la suppression ?')) {
      this.sousParcService.delete(id).subscribe(() => {
        this.snackBar.open('Sous-parc supprimé', '', { duration: 2000 });
        this.loadSousParcs();
      });
    }
  }
}
