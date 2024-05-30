import { TestBed } from '@angular/core/testing';

import { TestchecksService } from './testchecks.service';

describe('TestchecksService', () => {
  let service: TestchecksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestchecksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
