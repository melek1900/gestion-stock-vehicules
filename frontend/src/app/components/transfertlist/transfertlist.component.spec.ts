import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransfertlistComponent } from './transfertlist.component';

describe('TransfertlistComponent', () => {
  let component: TransfertlistComponent;
  let fixture: ComponentFixture<TransfertlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransfertlistComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransfertlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
