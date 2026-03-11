import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGenres } from './user-genres';

describe('UserGenres', () => {
  let component: UserGenres;
  let fixture: ComponentFixture<UserGenres>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserGenres]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserGenres);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
