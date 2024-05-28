import { TestBed } from '@angular/core/testing';

import { TestlistsService } from './testlists.service';

describe('TestlistsService', () => {
  let service: TestlistsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TestlistsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
