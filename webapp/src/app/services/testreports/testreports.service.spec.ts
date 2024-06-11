import { TestBed } from '@angular/core/testing';

import { TestreportsService } from './testreports.service';

describe('TestreportsService', () => {
  let service: TestreportsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestreportsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
