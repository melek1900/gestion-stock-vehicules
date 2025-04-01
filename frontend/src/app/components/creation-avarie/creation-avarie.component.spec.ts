import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreationAvarieComponent } from './creation-avarie.component';

describe('CreationAvarieComponent', () => {
  let component: CreationAvarieComponent;
  let fixture: ComponentFixture<CreationAvarieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreationAvarieComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreationAvarieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
