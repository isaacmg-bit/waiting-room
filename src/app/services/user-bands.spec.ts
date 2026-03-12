import { TestBed } from '@angular/core/testing';

import { UserBands } from './user-bands';

describe('UserBands', () => {
  let service: UserBands;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserBands);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
