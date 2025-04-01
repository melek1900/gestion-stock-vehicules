import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculeTransportDialogComponent } from './vehicule-transport-dialog.component';

describe('VehiculeTransportDialogComponent', () => {
  let component: VehiculeTransportDialogComponent;
  let fixture: ComponentFixture<VehiculeTransportDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculeTransportDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiculeTransportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
