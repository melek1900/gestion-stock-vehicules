import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChauffeurDialogComponent } from './chauffeur-dialog.component';

describe('ChauffeurDialogComponent', () => {
  let component: ChauffeurDialogComponent;
  let fixture: ComponentFixture<ChauffeurDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChauffeurDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChauffeurDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
