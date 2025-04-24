import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupTransfertComponent } from './popup-transfert.component';

describe('PopupTransfertComponent', () => {
  let component: PopupTransfertComponent;
  let fixture: ComponentFixture<PopupTransfertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupTransfertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupTransfertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
