import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomepageExpertComponent } from './homepage-expert.component';

describe('HomepageExpertComponent', () => {
  let component: HomepageExpertComponent;
  let fixture: ComponentFixture<HomepageExpertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomepageExpertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomepageExpertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
