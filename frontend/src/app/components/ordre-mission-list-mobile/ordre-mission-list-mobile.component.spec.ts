import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdreMissionListMobileComponent } from './ordre-mission-list-mobile.component';

describe('OrdreMissionListMobileComponent', () => {
  let component: OrdreMissionListMobileComponent;
  let fixture: ComponentFixture<OrdreMissionListMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdreMissionListMobileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdreMissionListMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
