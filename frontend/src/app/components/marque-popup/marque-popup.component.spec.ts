import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarquePopupComponent } from './marque-popup.component';

describe('MarquePopupComponent', () => {
  let component: MarquePopupComponent;
  let fixture: ComponentFixture<MarquePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarquePopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarquePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
