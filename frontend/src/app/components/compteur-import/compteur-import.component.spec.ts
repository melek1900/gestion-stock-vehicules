import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompteurImportComponent } from './compteur-import.component';

describe('CompteurImportComponent', () => {
  let component: CompteurImportComponent;
  let fixture: ComponentFixture<CompteurImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompteurImportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompteurImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
