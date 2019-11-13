import { TestBed } from '@angular/core/testing';

import { StaticDetailsService } from './static-details.service';

describe('StaticDetailsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StaticDetailsService = TestBed.get(StaticDetailsService);
    expect(service).toBeTruthy();
  });
});
