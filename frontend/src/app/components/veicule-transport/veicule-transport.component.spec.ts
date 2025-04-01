import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VeiculeTransportComponent } from './veicule-transport.component';

describe('VeiculeTransportComponent', () => {
  let component: VeiculeTransportComponent;
  let fixture: ComponentFixture<VeiculeTransportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VeiculeTransportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VeiculeTransportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
