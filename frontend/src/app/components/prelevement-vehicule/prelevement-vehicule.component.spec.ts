import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrelevementVehiculeComponent } from './prelevement-vehicule.component';

describe('PrelevementVehiculeComponent', () => {
  let component: PrelevementVehiculeComponent;
  let fixture: ComponentFixture<PrelevementVehiculeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrelevementVehiculeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrelevementVehiculeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
