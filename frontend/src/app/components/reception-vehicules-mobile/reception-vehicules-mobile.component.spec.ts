import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptionVehiculesMobileComponent } from './reception-vehicules-mobile.component';

describe('ReceptionVehiculesMobileComponent', () => {
  let component: ReceptionVehiculesMobileComponent;
  let fixture: ComponentFixture<ReceptionVehiculesMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceptionVehiculesMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceptionVehiculesMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
