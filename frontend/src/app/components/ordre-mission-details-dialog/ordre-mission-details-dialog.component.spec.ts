import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdreMissionDetailsDialogComponent } from './ordre-mission-details-dialog.component';

describe('OrdreMissionDetailsDialogComponent', () => {
  let component: OrdreMissionDetailsDialogComponent;
  let fixture: ComponentFixture<OrdreMissionDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdreMissionDetailsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdreMissionDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
