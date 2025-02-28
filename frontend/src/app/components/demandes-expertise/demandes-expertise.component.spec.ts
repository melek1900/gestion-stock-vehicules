import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandesExpertiseComponent } from './demandes-expertise.component';

describe('DemandesExpertiseComponent', () => {
  let component: DemandesExpertiseComponent;
  let fixture: ComponentFixture<DemandesExpertiseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandesExpertiseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandesExpertiseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
