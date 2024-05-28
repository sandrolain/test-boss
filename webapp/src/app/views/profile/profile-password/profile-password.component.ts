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
import {
  invalidPasswordValidator,
  unmatchingPasswordValidator,
} from '../../../lib/validators';
import { AuthService } from '../../../services/auth/auth.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { UserDto } from '../../../services/users/users.model';
import { PageTitleComponent } from '../../../widgets/page-title/page-title.component';

@Component({
  selector: 'app-profile-password',
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
    <app-page-title icon="password" [back]="['/profile']"
      ><span i18n>Change Password</span></app-page-title
    >
    <div class="crud-form">
      <form [formGroup]="passwordForm" (ngSubmit)="onSubmit()">
        <mat-form-field size="1:2">
          <input
            matInput
            type="password"
            placeholder="Old Password"
            formControlName="old_password"
          />
          @if(passwordForm.get('old_password')?.touched ) {
          @if(passwordForm.get('old_password')?.hasError('required')) {
          <mat-error i18n>Old Password is required</mat-error>}
          @else if(passwordForm.get('old_password')?.hasError('invalidPassword')) {
          <mat-error i18n>Old Password must be valid</mat-error>} }
        </mat-form-field>
        <div size="1:2"></div>
        <mat-form-field size="1:2">
          <input
            matInput
            type="password"
            placeholder="New Password"
            formControlName="new_password"
          />
          @if(passwordForm.get('new_password')?.touched ) {
          @if(passwordForm.get('new_password')?.hasError('required')) {
          <mat-error i18n>New Password is required</mat-error>}
          @else if(passwordForm.get('new_password')?.hasError('invalidPassword')) {
          <mat-error i18n>New Password must be valid</mat-error>} }
        </mat-form-field>
        <mat-form-field size="1:2">
          <input
            matInput
            type="password"
            placeholder="Confirm Password"
            formControlName="rpt_password"
          />
          @if(passwordForm.get('rpt_password')?.touched ) {
          @if(passwordForm.get('rpt_password')?.hasError('required')) {
          <mat-error i18n>Confirm Password is required</mat-error>}
          @else if(passwordForm.get('rpt_password')?.hasError('invalidPassword')) {
          <mat-error i18n>Confirm Password must be valid</mat-error>}
          @else if(passwordForm.hasError('notSame')) {
          <mat-error i18n>New Passwords not match</mat-error>} }
        </mat-form-field>
        <button mat-raised-button color="primary" type="submit">Save</button>
      </form>
    </div>
  `,
  styles: ``,
})
export class ProfilePasswordComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  passwordForm = new FormGroup(
    {
      old_password: new FormControl('', [
        Validators.required,
        invalidPasswordValidator,
      ]),
      new_password: new FormControl('', [
        Validators.required,
        invalidPasswordValidator,
      ]),
      rpt_password: new FormControl('', [
        Validators.required,
        invalidPasswordValidator,
      ]),
    },
    {
      validators: [unmatchingPasswordValidator('new_password', 'rpt_password')],
    }
  );

  user?: UserDto;

  ngOnInit() {
    this.user = this.authService.getUser();
  }

  onSubmit() {
    if (!this.passwordForm.valid) {
      this.notificationService.error($localize`Please fill in all required fields`);
      return;
    }
    this.authService
      .changePassword({
        old_password: this.passwordForm.value.old_password!,
        new_password: this.passwordForm.value.new_password!,
      })
      .then(() => {
        this.notificationService.confirm($localize`Password changed successfully`);
        this.router.navigate(['/profile']);
      })
      .catch(() => {
        this.notificationService.error($localize`Failed to change password`);
      });
  }
}
