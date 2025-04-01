import { TestBed } from '@angular/core/testing';

import { AvarieService } from './avarie.service';

describe('AvarieService', () => {
  let service: AvarieService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AvarieService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
