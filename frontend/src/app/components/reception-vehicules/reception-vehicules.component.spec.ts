import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptionVehiculesComponent } from './reception-vehicules.component';

describe('ReceptionVehiculesComponent', () => {
  let component: ReceptionVehiculesComponent;
  let fixture: ComponentFixture<ReceptionVehiculesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceptionVehiculesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceptionVehiculesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
