import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvarieFormComponent } from './avarie-form.component';

describe('AvarieFormComponent', () => {
  let component: AvarieFormComponent;
  let fixture: ComponentFixture<AvarieFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvarieFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvarieFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
