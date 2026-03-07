import { Component, inject } from '@angular/core';
import { UserService } from '../../services/user-service';
import { FormBuilder } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-edit-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css',
})
export class EditProfile {
  readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);

  ngOnInit() {
    this.userService.getMe().subscribe((user) => {
      this.form.patchValue({
        name: user.name,
        email: user.email,
        location: user.location,
      });
    });
  }

  form = this.fb.group({
    name: [''],
    email: [{ value: '', disabled: true }],
    location: [''],
  });
}
