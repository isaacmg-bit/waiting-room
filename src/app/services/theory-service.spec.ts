import { TestBed } from '@angular/core/testing';

import { TheoryService } from './theory-service';

describe('TheoryService', () => {
  let service: TheoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TheoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
