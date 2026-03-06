import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostLogin } from './post-login';

describe('PostLogin', () => {
  let component: PostLogin;
  let fixture: ComponentFixture<PostLogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostLogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostLogin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
