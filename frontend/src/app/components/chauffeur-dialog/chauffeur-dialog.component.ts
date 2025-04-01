import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_FORMATS, MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

// ✅ Format personnalisé pour les dates
export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'dd/MM/yyyy',
    monthYearLabel: 'MMMM yyyy',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM yyyy',
  }
};

@Component({
  selector: 'app-chauffeur-dialog',
  standalone: true,
  templateUrl: './chauffeur-dialog.component.html',
  styleUrls: ['./chauffeur-dialog.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatOptionModule,
    MatSelectModule
  ],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS }
  ]
})
export class ChauffeurDialogComponent {
  chauffeurForm: FormGroup;
  isReadOnly = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ChauffeurDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isReadOnly = data?.mode === 'view';
    this.isEditMode = data?.mode === 'edit';

    this.chauffeurForm = this.fb.group({
      nom: [{ value: data?.chauffeur?.nom || '', disabled: this.isReadOnly }, Validators.required],
      prenom: [{ value: data?.chauffeur?.prenom || '', disabled: this.isReadOnly }, Validators.required],
      qualification: [{ value: data?.chauffeur?.qualification || '', disabled: this.isReadOnly }],
      cin: [{ value: data?.chauffeur?.cin || '', disabled: this.isReadOnly }],
      telephone: [{ value: data?.chauffeur?.telephone || '', disabled: this.isReadOnly }, Validators.required],
      dateDelivrance: [
        {
          value: data?.chauffeur?.dateDelivrance ? new Date(data.chauffeur.dateDelivrance) : null,
          disabled: this.isReadOnly
        }
      ],
      numeroPermis: [{ value: data?.chauffeur?.numeroPermis || '', disabled: this.isReadOnly }],
      statut: [{ value: data?.chauffeur?.statut || '', disabled: this.isReadOnly }, Validators.required]
    });
  }

  onSubmit() {
    if (this.chauffeurForm.valid) {
      this.dialogRef.close(this.chauffeurForm.getRawValue());
    }
  }

  onClose() {
    this.dialogRef.close();
  }
}
