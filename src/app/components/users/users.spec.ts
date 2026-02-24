import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { signal } from '@angular/core';
import { Users } from './users';
import { UserService } from '../../services/user-service';

const mockUserService = {
  usersSignal: signal<any[]>([]),
  loadingSignal: signal<boolean>(false),
  addUser: vi.fn(),
  editUser: vi.fn(),
  deleteUser: vi.fn(),
};

describe('Users Component', () => {
  let component: Users;
  let fixture: ComponentFixture<Users>;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [Users, ReactiveFormsModule, RouterModule.forRoot([])],
      providers: [{ provide: UserService, useValue: mockUserService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Users);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('form initialization', () => {
    it('should initialize with empty fields and invalid state', () => {
      expect(component.userForm.valid).toBe(false);
      expect(component.userForm.get('name')?.value).toBe('');
      expect(component.userForm.get('email')?.value).toBe('');
      expect(component.userForm.get('location')?.value).toBe('');
    });

    it('should be valid when all fields are correctly filled', () => {
      component.userForm.setValue({ name: 'Lleison', email: 'lleisonbeker@mail.com', location: 'Estates' });
      expect(component.userForm.valid).toBe(true);
    });
  });

  describe('loadUserForEdit', () => {
    it('should enter edit mode and populate the form', () => {
      const user = { id: 'u1', name: 'Lleison', email: 'lleisonbeker@mail.com', location: 'Estates' };
      component.loadUserForEdit(user);

      expect(component.isEditMode).toBe(true);
      expect(component.editingUserId).toBe('u1');
      expect(component.userForm.get('name')?.value).toBe('Lleison');
      expect(component.userForm.get('email')?.value).toBe('lleisonbeker@mail.com');
      expect(component.userForm.get('location')?.value).toBe('Estates');
    });
  });

  describe('cancelEdit', () => {
    it('should reset the form and exit edit mode', () => {
      component.loadUserForEdit({
        id: 'u1',
        name: 'Lleison',
        email: 'lleisonbeker@mail.com',
        location: 'Estates',
      });
      component.cancelEdit();

      expect(component.isEditMode).toBe(false);
      expect(component.editingUserId).toBeNull();
      expect(component.userForm.get('name')?.value).toBeNull();
    });
  });

  describe('onSubmit', () => {
    it('should not call any service method if the form is invalid', () => {
      component.onSubmit();

      expect(mockUserService.addUser).not.toHaveBeenCalled();
      expect(mockUserService.editUser).not.toHaveBeenCalled();
    });

    it('should call addUser when form is valid and not in edit mode', () => {
      component.userForm.setValue({ name: 'Lleison', email: 'lleisonbeker@mail.com', location: 'Estates' });
      component.onSubmit();

      expect(mockUserService.addUser).toHaveBeenCalledWith({
        name: 'Lleison',
        email: 'lleisonbeker@mail.com',
        location: 'Estates',
      });
      expect(mockUserService.editUser).not.toHaveBeenCalled();
    });

    it('should call editUser when form is valid and in edit mode', () => {
      component.loadUserForEdit({
        id: 'u1',
        name: 'Lleison',
        email: 'lleisonbeker@mail.com',
        location: 'Estates',
      });
      component.userForm.setValue({ name: 'Estif', email: 'estifvei@mail.com', location: 'Milwoki' });
      component.onSubmit();

      expect(mockUserService.editUser).toHaveBeenCalledWith('u1', {
        name: 'Estif',
        email: 'estifvei@mail.com',
        location: 'Milwoki',
      });
      expect(mockUserService.addUser).not.toHaveBeenCalled();
    });

    it('should reset the form after a successful submit', () => {
      component.userForm.setValue({ name: 'Lleison', email: 'lleisonbeker@mail.com', location: 'Estates' });
      component.onSubmit();

      expect(component.isEditMode).toBe(false);
      expect(component.editingUserId).toBeNull();
      expect(component.userForm.get('name')?.value).toBeNull();
    });
  });

  describe('onDelete', () => {
    it('should call deleteUser when the user confirms', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      component.onDelete('u1');
      expect(mockUserService.deleteUser).toHaveBeenCalledWith('u1');
    });

    it('should not call deleteUser when the user cancels', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      component.onDelete('u1');
      expect(mockUserService.deleteUser).not.toHaveBeenCalled();
    });
  });

  describe('form error getters', () => {
    it('should return required error for name when empty', () => {
      component.userForm.get('name')?.markAsTouched();
      expect(component.nameError).toBe('Name is required');
    });

    it('should return minlength error for name when too short', () => {
      component.userForm.get('name')?.setValue('A');
      expect(component.nameError).toBe('Name must be at least 2 characters');
    });

    it('should return required error for email when empty', () => {
      component.userForm.get('email')?.markAsTouched();
      expect(component.emailError).toBe('Email is required');
    });

    it('should return invalid format error for bad email', () => {
      component.userForm.get('email')?.setValue('not-an-email');
      expect(component.emailError).toBe('Invalid email format');
    });

    it('should return required error for location when empty', () => {
      component.userForm.get('location')?.markAsTouched();
      expect(component.locationError).toBe('Location is required');
    });

    it('should return minlength error for location when too short', () => {
      component.userForm.get('location')?.setValue('A');
      expect(component.locationError).toBe('Location must be at least 2 characters');
    });

    it('should return empty string when all fields are valid', () => {
      component.userForm.setValue({ name: 'Lleison', email: 'lleisonbeker@mail.com', location: 'Estates' });
      expect(component.nameError).toBe('');
      expect(component.emailError).toBe('');
      expect(component.locationError).toBe('');
    });
  });
});
