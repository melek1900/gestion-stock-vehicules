import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReparationMobileComponent } from './reparation-mobile.component';

describe('ReparationMobileComponent', () => {
  let component: ReparationMobileComponent;
  let fixture: ComponentFixture<ReparationMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReparationMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReparationMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
