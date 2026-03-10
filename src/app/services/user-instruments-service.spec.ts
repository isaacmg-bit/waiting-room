import { TestBed } from '@angular/core/testing';

import { UserInstrumentsService } from './user-instruments-service';

describe('UserInstrumentsService', () => {
  let service: UserInstrumentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserInstrumentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
