import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculeSousParcListComponent } from './vehicule-sous-parc-list.component';

describe('VehiculeSousParcListComponent', () => {
  let component: VehiculeSousParcListComponent;
  let fixture: ComponentFixture<VehiculeSousParcListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehiculeSousParcListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehiculeSousParcListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
