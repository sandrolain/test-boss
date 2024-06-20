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
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../services/notification/notification.service';
import { UserDto, UserEditDto } from '../../../services/users/users.model';
import { UsersService } from '../../../services/users/users.service';
import { PageTitleComponent } from '../../../widgets/page-title/page-title.component';

@Component({
  selector: 'app-users-edit',
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
    <app-page-title
      icon="edit"
      [back]="userId ? ['/users/detail', userId] : ['/users']"
      >{{ pageTitle }} {{ user?.firstname }}
      {{ user?.lastname }}</app-page-title
    >
    <div class="crud-form">
      <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
        <mat-form-field size="1:2">
          <mat-label i18n>Firstname</mat-label>
          <input matInput formControlName="firstname" />
          @if(userForm.get('firstname')?.hasError('required')) {
          <mat-error i18n>Firstname is required</mat-error>}
        </mat-form-field>
        <mat-form-field size="1:2">
          <mat-label i18n>Lastname</mat-label>
          <input matInput formControlName="lastname" />
          @if(userForm.get('lastname')?.hasError('required')) {
          <mat-error i18n>Lastname is required</mat-error>}
        </mat-form-field>
        <mat-form-field size="1:2">
          <mat-label i18n>Email</mat-label>
          <input matInput type="email" formControlName="email" />
          @if(userForm.get('email')?.hasError('required')) {
          <mat-error i18n>Email is required</mat-error>
          } @if(userForm.get('email')?.hasError('email')) {
          <mat-error i18n>Invalid email format</mat-error>}
        </mat-form-field>
        <mat-form-field size="1:2">
          <mat-label i18n>Phone</mat-label>
          <input matInput type="tel" formControlName="phone" />
          @if(userForm.get('phone')?.hasError('pattern')) {
          <mat-error i18n>Invalid phone format</mat-error>}
        </mat-form-field>
        <mat-form-field>
          <mat-label i18n>Address</mat-label>
          <input matInput formControlName="address" />
        </mat-form-field>
        <button mat-raised-button color="primary" type="submit" i18n>
          Save
        </button>
      </form>
    </div>
  `,
  styles: ``,
})
export class UsersEditComponent {
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

  userId?: string;
  user?: UserDto;
  pageTitle = $localize`Create User`;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.userId = params['id'];
      if (this.userId) {
        this.pageTitle = $localize`Edit User: `;
        this.userService
          .getUser(this.userId)
          .then((user) => {
            this.user = user;
            this.userForm.patchValue(user);
          })
          .catch((err) => {
            this.notificationService.error($localize`Failed to load user`);
          });
      }
    });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.notificationService.error(
        $localize`Please fill in all required fields`
      );
      return;
    }

    if (this.userId) {
      this.userService
        .updateUser(this.user!._id, this.userForm.value as UserEditDto)
        .then(() => {
          this.notificationService.confirm($localize`User updated`);
          this.router.navigate(['/users']);
        })
        .catch(() => {
          this.notificationService.error($localize`Failed to update user`);
        });
    } else {
      this.userService
        .createUser(this.userForm.value as UserEditDto)
        .then(() => {
          this.notificationService.confirm($localize`User created`);
          this.router.navigate(['/users']);
        })
        .catch(() => {
          this.notificationService.error($localize`Failed to create user`);
        });
    }
  }
}
