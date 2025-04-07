import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-popup-utilisateur',
  imports: [ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    NgIf,
    NgFor],
  templateUrl: './popup-utilisateur.component.html',
  styleUrl: './popup-utilisateur.component.scss'
})
export class PopupUtilisateurComponent {
  form: FormGroup;
  isModification = false;
  roles = [
    'ROLE_ADMINISTRATEUR',
    'ROLE_GESTIONNAIRE_STOCK',
    'ROLE_MANAGER',
    'ROLE_EXPERT',
    'ROLE_COMMERCIAL',
    'ROLE_GESTIONNAIRE_APPLICATION'
  ];

  parcsDisponibles: any[] = [];
  marquesDisponibles: string[] = ['GM', 'ISUZU', 'CHEVROLET'];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PopupUtilisateurComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      id: [data?.utilisateur?.id || null],
      nom: [data?.utilisateur?.nom || ''],
      prenom: [data?.utilisateur?.prenom || ''],
      email: [data?.utilisateur?.email || ''],
      motDePasse: [''],
      role: [data?.utilisateur?.role || ''],
      parcsAccessibles: [data?.utilisateur?.parcsAccessibles || []],
      marquesAccessibles: [data?.utilisateur?.marquesAccessibles || []]
    });

    if (data?.utilisateur) {
      this.isModification = true;
    }

    this.parcsDisponibles = data?.parcsDisponibles || [];
  }

  formatRole(role: string): string {
    return role.replace('ROLE_', '').replace('_', ' ');
  }

  enregistrer() {
    if (this.form.invalid) return;
    const utilisateur = this.form.value;
    this.dialogRef.close({ action: 'update', data: utilisateur });
  }

  supprimer() {
    this.dialogRef.close({ action: 'delete', data: { id: this.form.value.id } });
  }
}
