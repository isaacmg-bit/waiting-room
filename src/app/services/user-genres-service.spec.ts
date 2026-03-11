import { TestBed } from '@angular/core/testing';

import { UserGenresService } from './user-genres-service';

describe('UserGenresService', () => {
  let service: UserGenresService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserGenresService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
