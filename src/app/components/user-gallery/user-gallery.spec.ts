import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserGallery } from './user-gallery';

describe('UserGallery', () => {
  let component: UserGallery;
  let fixture: ComponentFixture<UserGallery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserGallery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserGallery);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
