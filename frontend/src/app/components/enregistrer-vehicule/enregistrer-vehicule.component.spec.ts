import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnregistrerVehiculeComponent } from './enregistrer-vehicule.component';

describe('EnregistrerVehiculeComponent', () => {
  let component: EnregistrerVehiculeComponent;
  let fixture: ComponentFixture<EnregistrerVehiculeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnregistrerVehiculeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnregistrerVehiculeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
