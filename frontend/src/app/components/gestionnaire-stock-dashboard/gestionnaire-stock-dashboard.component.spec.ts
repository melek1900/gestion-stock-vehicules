import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionnaireStockDashboardComponent } from './gestionnaire-stock-dashboard.component';

describe('GestionnaireStockDashboardComponent', () => {
  let component: GestionnaireStockDashboardComponent;
  let fixture: ComponentFixture<GestionnaireStockDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionnaireStockDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionnaireStockDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
