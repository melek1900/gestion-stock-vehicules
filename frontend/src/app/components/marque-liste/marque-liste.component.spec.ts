import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarqueListeComponent } from './marque-liste.component';

describe('MarqueListeComponent', () => {
  let component: MarqueListeComponent;
  let fixture: ComponentFixture<MarqueListeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarqueListeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarqueListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
