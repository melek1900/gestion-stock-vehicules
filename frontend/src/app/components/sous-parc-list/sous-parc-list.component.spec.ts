import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SousParcListComponent } from './sous-parc-list.component';

describe('SousParcListComponent', () => {
  let component: SousParcListComponent;
  let fixture: ComponentFixture<SousParcListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SousParcListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SousParcListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
