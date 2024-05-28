import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { UserDto, UserEditDto } from '../../../services/users/users.model';
import { UsersService } from '../../../services/users/users.service';
import { PageTitleComponent } from '../../../widgets/page-title/page-title.component';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    PageTitleComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <app-page-title icon="edit" [back]="['/profile']"
      ><span i18n>Edit Profile</span></app-page-title
    >
    <div class="crud-form">
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
        <mat-form-field size="1:2">
          <input matInput placeholder="Firstname" formControlName="firstname" />
          @if(userForm.get('firstname')?.hasError('required')) {
          <mat-error i18n>Firstname is required</mat-error>}
        </mat-form-field>
        <mat-form-field size="1:2">
          <input matInput placeholder="Lastname" formControlName="lastname" />
          @if(userForm.get('lastname')?.hasError('required')) {
          <mat-error i18n>Lastname is required</mat-error>}
        </mat-form-field>
        <mat-form-field size="1:2">
          <input
            matInput
            placeholder="Email"
            type="email"
            formControlName="email"
          />
          @if(userForm.get('email')?.hasError('required')) {
          <mat-error i18n>Email is required</mat-error>
          } @if(userForm.get('email')?.hasError('email')) {
          <mat-error i18n>Invalid email format</mat-error>}
        </mat-form-field>
        <mat-form-field size="1:2">
          <input
            matInput
            placeholder="Phone"
            type="tel"
            formControlName="phone"
          />
          @if(userForm.get('phone')?.hasError('pattern')) {
          <mat-error i18n>Invalid phone format</mat-error>}
        </mat-form-field>
        <mat-form-field>
          <input matInput placeholder="Address" formControlName="address" />
        </mat-form-field>
        <button mat-raised-button color="primary" type="submit" i18n>
          Save
        </button>
      </form>
    </div>
  `,
  styles: ``,
})
export class ProfileEditComponent {
  private authService = inject(AuthService);
  private userService = inject(UsersService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  userForm = new FormGroup({
    firstname: new FormControl('', [Validators.required]),
    lastname: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.pattern('^\\+?[0-9\\s()-]*$')]),
    address: new FormControl(''),
  });

  user?: UserDto;

  ngOnInit() {
    this.user = this.authService.getUser();
    this.userForm.patchValue(this.user!);
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.notificationService.error(
        $localize`Please fill in all required fields`
      );
      return;
    }
    this.userService
      .updateUser(this.user!._id, this.userForm.value as UserEditDto)
      .then(async () => {
        this.notificationService.confirm($localize`User updated`);
        this.router.navigate(['/profile']);

        this.authService.updateSession();
      })
      .catch(() => {
        this.notificationService.error($localize`Failed to update user`);
      });
  }
}
