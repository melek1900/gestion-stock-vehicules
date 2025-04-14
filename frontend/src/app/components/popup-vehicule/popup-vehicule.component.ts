import { Component, ElementRef, Inject, QueryList, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { NgIf, NgFor } from '@angular/common';

@Component({
  selector: 'app-popup-vehicule',
  templateUrl: './popup-vehicule.component.html',
  styleUrls: ['./popup-vehicule.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    NgIf,
    NgFor,
  ],
})
export class PopupVehiculeComponent {
  form: FormGroup;
  isReadonly: boolean = false;
  photosPreviews: { [key: number]: string[] } = {};
  imageAgrandie: string | null = null;

  @ViewChildren('fileInput') fileInputs!: QueryList<ElementRef>;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PopupVehiculeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isReadonly = data?.isReadonly || false;

    this.form = this.fb.group({
      id: [data?.vehicule?.id || null],
      shortDescription: [{ value: data?.vehicule?.shortDescription || '', disabled: this.isReadonly }],
      modele: [{ value: data?.vehicule?.modele || '', disabled: this.isReadonly }],
      numeroChassis: [{ value: data?.vehicule?.numeroChassis || '', disabled: this.isReadonly }],
      shortColor: [{ value: data?.vehicule?.shortColor || '', disabled: this.isReadonly }],
      productionDate: [{
        value: data?.vehicule?.productionDate
          ? new Date(data.vehicule.productionDate).toISOString().substring(0, 10)
          : '',
        disabled: this.isReadonly
      }],      avaries: this.fb.array([]),
    });

    if (data?.vehicule?.avaries) {
      data.vehicule.avaries.forEach((av: any) => this.ajouterAvarieExistante(av));
    }
  }
  ouvrirImage(photoUrl: string) {
    this.imageAgrandie = photoUrl;
  }
  
  fermerImage() {
    this.imageAgrandie = null;
  }

  ajouterAvarieExistante(avarie: any) {
    const avariesFormArray = this.form.get('avaries') as FormArray;
    const avarieForm = this.fb.group({
      id: [avarie.id || null],
      type: [{ value: avarie.type, disabled: this.isReadonly }],
      commentaire: [{ value: avarie.commentaire, disabled: this.isReadonly }],
      photos: [avarie.photoUrls || []]
    });

    avariesFormArray.push(avarieForm);
    this.photosPreviews[avariesFormArray.length - 1] = avarie.photos || [];
  }

  get avariesForm(): FormArray {
    return this.form.get('avaries') as FormArray;
  }

  getFormControl(group: any, controlName: string) {
    return group.get(controlName);
  }
}
