import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-vehicule-transport-dialog',
  standalone: true,
  templateUrl: './vehicule-transport-dialog.component.html',
  styleUrls: ['./vehicule-transport-dialog.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatSelectModule
  ]
})
export class VehiculeTransportDialogComponent {
  vehiculeForm: FormGroup;
  isReadOnly = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<VehiculeTransportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isReadOnly = data?.mode === 'view';
    this.isEditMode = data?.mode === 'edit';

    this.vehiculeForm = this.fb.group({
      matricule: [{ value: data?.vehicule?.matricule || '', disabled: this.isReadOnly }, Validators.required],
      capacite: [{ value: data?.vehicule?.capacite || '', disabled: this.isReadOnly }, Validators.required],
      type: [{ value: data?.vehicule?.type || '', disabled: this.isReadOnly }, Validators.required],
      disponible: [{ value: data?.vehicule?.disponible ?? true, disabled: this.isReadOnly }, Validators.required]
    });
  }

  onSubmit() {
    if (this.vehiculeForm.valid) {
      this.dialogRef.close(this.vehiculeForm.getRawValue());
    }
  }

  onClose() {
    this.dialogRef.close();
  }
}
