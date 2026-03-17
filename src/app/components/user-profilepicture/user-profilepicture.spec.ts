import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfilepicture } from './user-profilepicture';

describe('UserProfilepicture', () => {
  let component: UserProfilepicture;
  let fixture: ComponentFixture<UserProfilepicture>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfilepicture]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserProfilepicture);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
