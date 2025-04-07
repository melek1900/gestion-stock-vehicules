import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupUtilisateurComponent } from './popup-utilisateur.component';

describe('PopupUtilisateurComponent', () => {
  let component: PopupUtilisateurComponent;
  let fixture: ComponentFixture<PopupUtilisateurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupUtilisateurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupUtilisateurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
