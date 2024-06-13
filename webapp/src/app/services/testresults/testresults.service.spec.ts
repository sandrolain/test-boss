import { TestBed } from '@angular/core/testing';

import { TestresultsService } from './testresults.service';

describe('TestresultsService', () => {
  let service: TestresultsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestresultsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
