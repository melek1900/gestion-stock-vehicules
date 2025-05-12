import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupSousParcComponent } from './popup-sous-parc.component';

describe('PopupSousParcComponent', () => {
  let component: PopupSousParcComponent;
  let fixture: ComponentFixture<PopupSousParcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupSousParcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupSousParcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
