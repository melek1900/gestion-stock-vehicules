import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAvarieComponent } from './popup-avarie.component';

describe('PopupAvarieComponent', () => {
  let component: PopupAvarieComponent;
  let fixture: ComponentFixture<PopupAvarieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopupAvarieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAvarieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
