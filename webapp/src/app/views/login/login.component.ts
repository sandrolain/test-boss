import { Component, OnInit, inject } from '@angular/core';
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
import { invalidPasswordValidator } from '../../lib/validators';
import { AuthService } from '../../services/auth/auth.service';
import { NotificationService } from '../../services/notification/notification.service';
import { PageTitleComponent } from '../../widgets/page-title/page-title.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    PageTitleComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  providers: [],
  template: `
    <div class="login-form">
      <h2 i18n>Login</h2>
      <form [formGroup]="loginForm" (ngSubmit)="handleSubmit()">
        <mat-form-field>
          <mat-label i18n>Email</mat-label>
          <input matInput type="email" formControlName="email" />
          @if (loginForm.controls.email.invalid &&
          loginForm.controls.email.touched) {
          <mat-error i18n>Please enter a valid email address</mat-error>
          }
        </mat-form-field>
        <mat-form-field>
          <mat-label i18n>Password</mat-label>
          <input matInput type="password" formControlName="password" />
          @if (loginForm.controls.password.invalid &&
          loginForm.controls.password.touched) {
          <mat-error i18n>Password is required and must be valid</mat-error>
          }
        </mat-form-field>
        <div class="buttons">
          <button mat-raised-button color="primary" type="submit" i18n>
            Login
          </button>
        </div>
        <div class="buttons">
          <button
            mat-button
            color="accent"
            type="button"
            (click)="toRecovery()"
            i18n
          >
            Forgot your password?
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [``],
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      invalidPasswordValidator,
    ]),
  });

  ngOnInit() {
    if (this.authService.loggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  handleSubmit() {
    if (this.loginForm.invalid) {
      this.notificationService.warn($localize`Invalid form data`);
      return;
    }

    const data = this.loginForm.value;

    this.authService
      .login({
        email: data.email!,
        password: data.password!,
      })
      .then(
        (res) => {
          if (res) {
            // Redirect to dashboard
            this.router.navigate(['/dashboard']);
            this.notificationService.confirm($localize`Logged in successfully`);
          }
        },
        (err) => {
          console.error(err);
          this.notificationService.error($localize`Invalid email or password`);
        }
      );
  }

  toRecovery() {
    const email = this.loginForm.get('email')?.value;
    this.router.navigate(['/password-recovery'], {
      queryParams: { email },
    });
  }
}
