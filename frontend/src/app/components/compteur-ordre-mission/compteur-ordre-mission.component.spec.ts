import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompteurOrdreMissionComponent } from './compteur-ordre-mission.component';

describe('CompteurOrdreMissionComponent', () => {
  let component: CompteurOrdreMissionComponent;
  let fixture: ComponentFixture<CompteurOrdreMissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompteurOrdreMissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompteurOrdreMissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
