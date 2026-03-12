import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserBands } from './user-bands';

describe('UserBands', () => {
  let component: UserBands;
  let fixture: ComponentFixture<UserBands>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserBands]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserBands);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
