import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupVehiculeComponent } from './popup-vehicule.component';

describe('PopupVehiculeComponent', () => {
  let component: PopupVehiculeComponent;
  let fixture: ComponentFixture<PopupVehiculeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupVehiculeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupVehiculeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
