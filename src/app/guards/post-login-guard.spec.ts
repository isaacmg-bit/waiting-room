import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { postLoginGuard } from './post-login-guard';

describe('postLoginGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => postLoginGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
