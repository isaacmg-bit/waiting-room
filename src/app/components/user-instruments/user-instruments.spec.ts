import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserInstruments } from './user-instruments';

describe('UserInstruments', () => {
  let component: UserInstruments;
  let fixture: ComponentFixture<UserInstruments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserInstruments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserInstruments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
