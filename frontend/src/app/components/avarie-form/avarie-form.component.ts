import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-avarie-form',
  templateUrl: './avarie-form.component.html',
  styleUrls: ['./avarie-form.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class AvarieFormComponent {
  form: FormGroup;
  photo: File | null = null;

  typesAvaries = ['Rayure', 'Bosse', 'Pièce manquante', 'Autre'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      type: ['', Validators.required],
      commentaire: [''],
    });
  }

  onFileSelected(event: any) {
    this.photo = event.target.files[0];
  }

  enregistrerAvarie() {
    if (this.form.valid) {
      const formData = new FormData();
      formData.append('type', this.form.value.type);
      formData.append('commentaire', this.form.value.commentaire);
      if (this.photo) {
        formData.append('photo', this.photo);
      }

      this.http.post(`http://localhost:8080/api/avaries/1`, this.form.value).subscribe({
        next: () => {
          this.snackBar.open('Avarie enregistrée avec succès', 'Fermer', { duration: 3000 });
          this.form.reset();
        },
        error: () => {
          this.snackBar.open('Erreur lors de l’enregistrement', 'Fermer', { duration: 3000 });
        },
      });
    }
  }
}
