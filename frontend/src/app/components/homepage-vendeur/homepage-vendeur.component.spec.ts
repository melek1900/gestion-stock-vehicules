import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomepageVendeurComponent } from './homepage-vendeur.component';

describe('HomepageVendeurComponent', () => {
  let component: HomepageVendeurComponent;
  let fixture: ComponentFixture<HomepageVendeurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomepageVendeurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomepageVendeurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
