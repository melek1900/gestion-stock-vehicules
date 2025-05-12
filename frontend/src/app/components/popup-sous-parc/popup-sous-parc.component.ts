import { Component } from '@angular/core';
import { SousParc, SousParcService } from '../../../services/sous-parc.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-popup-sous-parc',
  imports: [  MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule],
  templateUrl: './popup-sous-parc.component.html',
  styleUrl: './popup-sous-parc.component.scss'
})
export class PopupSousParcComponent {
  form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<PopupSousParcComponent>,
    private sousParcService: SousParcService,
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      nom: ['', Validators.required]
    });
  }

  submit(): void {
    if (this.form.valid) {
      const sousParc: SousParc = this.form.value;
      this.sousParcService.create(sousParc).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
