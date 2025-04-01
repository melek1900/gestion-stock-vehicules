import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnregistrerAvarieComponent } from './enregistrer-avarie.component';

describe('EnregistrerAvarieComponent', () => {
  let component: EnregistrerAvarieComponent;
  let fixture: ComponentFixture<EnregistrerAvarieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnregistrerAvarieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnregistrerAvarieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
