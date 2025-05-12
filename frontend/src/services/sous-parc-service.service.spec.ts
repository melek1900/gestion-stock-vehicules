import { TestBed } from '@angular/core/testing';

import { SousParcServiceService } from './sous-parc.service';

describe('SousParcServiceService', () => {
  let service: SousParcServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SousParcServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
