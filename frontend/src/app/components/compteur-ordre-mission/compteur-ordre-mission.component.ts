import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-compteur-ordre-mission',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatButtonModule,
    MatDividerModule,
  ],
  templateUrl: './compteur-ordre-mission.component.html',
  styleUrl: './compteur-ordre-mission.component.scss'
})
export class CompteurOrdreMissionComponent implements OnInit {
  annee: string = new Date().getFullYear().toString();
  compteur: number | null = null;
  form!: FormGroup;
  message: string = '';
  numeroComplet: string = '';
  nouvelleValeur: number | null = null;
  nouvelleAnnee: number | null = null;
  valeurInitiale: number | null = null;

  constructor(private http: HttpClient, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      annee: [this.annee, Validators.required],
      compteur: [0, [Validators.required, Validators.min(0)]]
    });
    this.chargerCompteur();
  }

  chargerCompteur() {
    this.http.get<any>(`http://192.168.1.121:8080/api/compteur-ordre-mission/${this.annee}`).subscribe({
      next: (data) => {
        this.compteur = data.compteur;
        this.numeroComplet = data.numeroComplet;
        this.form.patchValue({ compteur: this.compteur });
        this.message = '';
      },
      error: (err) => {
        this.message = `❌ Aucun compteur trouvé pour ${this.annee}`;
        this.compteur = null;
        this.numeroComplet = '';
      }
    });
  }

  modifierCompteur() {
    if (!this.annee || this.nouvelleValeur === null) return;

    const params = new HttpParams().set('nouveauCompteur', this.nouvelleValeur.toString());
    this.http.put<any>(`http://192.168.1.121:8080/api/compteur-ordre-mission/${this.annee}`, null, { params }).subscribe({
      next: (data) => {
        this.message = `✅ Compteur mis à jour : ${data.numeroComplet}`;
        this.compteur = data.compteur;
        this.numeroComplet = data.numeroComplet;
        this.nouvelleValeur = null;
      },
      error: () => {
        this.message = "❌ Erreur lors de la mise à jour.";
      }
    });
  }

  initialiserCompteur() {
    if (!this.nouvelleAnnee || this.valeurInitiale === null) return;

    const params = new HttpParams()
      .set('annee', this.nouvelleAnnee.toString())
      .set('compteur', this.valeurInitiale.toString());

    this.http.post<any>(`http://192.168.1.121:8080/api/compteur-ordre-mission/initialiser`, null, { params }).subscribe({
      next: (data) => {
        this.message = `✅ Compteur initialisé : ${data.numeroComplet}`;
        this.nouvelleAnnee = null;
        this.valeurInitiale = null;
      },
      error: () => {
        this.message = "❌ Erreur lors de l'initialisation.";
      }
    });
  }
}
