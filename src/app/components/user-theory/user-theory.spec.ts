import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTheory } from './user-theory';

describe('UserTheory', () => {
  let component: UserTheory;
  let fixture: ComponentFixture<UserTheory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserTheory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserTheory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
