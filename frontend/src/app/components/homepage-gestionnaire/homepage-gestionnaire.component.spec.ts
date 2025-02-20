import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomepageGestionnaireComponent } from './homepage-gestionnaire.component';

describe('HomepageGestionnaireComponent', () => {
  let component: HomepageGestionnaireComponent;
  let fixture: ComponentFixture<HomepageGestionnaireComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomepageGestionnaireComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomepageGestionnaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
