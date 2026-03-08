import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserLocation } from './user-location';

describe('UserLocation', () => {
  let component: UserLocation;
  let fixture: ComponentFixture<UserLocation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserLocation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserLocation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
