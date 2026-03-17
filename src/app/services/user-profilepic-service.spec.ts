import { TestBed } from '@angular/core/testing';

import { UserProfilePicService } from './user-profilepic-service';

describe('UserProfilepicService', () => {
  let service: UserProfilePicService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserProfilePicService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
