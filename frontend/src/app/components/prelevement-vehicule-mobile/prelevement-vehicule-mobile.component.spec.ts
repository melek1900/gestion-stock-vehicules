import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrelevementVehiculeMobileComponent } from './prelevement-vehicule-mobile.component';

describe('PrelevementVehiculeMobileComponent', () => {
  let component: PrelevementVehiculeMobileComponent;
  let fixture: ComponentFixture<PrelevementVehiculeMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrelevementVehiculeMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrelevementVehiculeMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
