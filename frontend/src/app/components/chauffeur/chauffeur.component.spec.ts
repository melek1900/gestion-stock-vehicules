import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChauffeurComponent } from './chauffeur.component';

describe('ChauffeurComponent', () => {
  let component: ChauffeurComponent;
  let fixture: ComponentFixture<ChauffeurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChauffeurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChauffeurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
