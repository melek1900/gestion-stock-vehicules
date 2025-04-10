import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
@Component({
  selector: 'app-marque-popup',
  imports: [ ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatCardModule,],
  templateUrl: './marque-popup.component.html',
  styleUrl: './marque-popup.component.scss'
})
export class MarquePopupComponent {
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<MarquePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = new FormGroup({
      nom: new FormControl('', [Validators.required, Validators.maxLength(50)])
    });
  }

  valider() {
    if (this.form.valid) {
      this.dialogRef.close({ action: 'add', data: this.form.value });
    }
  }

  annuler() {
    this.dialogRef.close();
  }
}
