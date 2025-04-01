import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdreMissionListComponent } from './ordre-mission-list.component';

describe('OrdreMissionListComponent', () => {
  let component: OrdreMissionListComponent;
  let fixture: ComponentFixture<OrdreMissionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdreMissionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdreMissionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
