import { TestBed } from '@angular/core/testing';

import { ApiserviceBack } from './apiservice-back';

describe('ApiserviceBack', () => {
  let service: ApiserviceBack;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiserviceBack);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
