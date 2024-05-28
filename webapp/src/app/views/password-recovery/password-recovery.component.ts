import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import {
  invalidPasswordValidator,
  unmatchingPasswordValidator,
} from '../../lib/validators';
import { AuthService } from '../../services/auth/auth.service';
import { NotificationService } from '../../services/notification/notification.service';
import { LoaderOverlayComponent } from '../../widgets/loader-overlay/loader-overlay.component';

@Component({
  selector: 'app-password-recovery',
  standalone: true,
  imports: [
    LoaderOverlayComponent,
    MatButtonModule,
    FormsModule,
    MatFormField,
    ReactiveFormsModule,
    MatInputModule,
  ],
  template: `
    @if(loading) {
    <app-loader-overlay></app-loader-overlay>
    } @else if (token) {
    <div class="login-form recovery recovery-password">
      <h2 i18n>Specify new password</h2>
      <form [formGroup]="passwordForm" (ngSubmit)="onPasswordSubmit()">
        <mat-form-field>
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
        <mat-form-field>
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
        <div class="buttons">
          <button mat-raised-button color="primary" type="submit" i18n>Save</button>
        </div>
        <div class="buttons">
          <button mat-button color="accent" type="button" (click)="toLogin()" i18n>Back to login</button>
        </div>
      </form>
    </div>
    } @else {
    <div class="login-form recovery recovery-email">
      <h2 i18n>Specify email for the account to recover</h2>
      <form [formGroup]="emailForm" (submit)="onEmailSubmit()">
        <mat-form-field>
          <input
            matInput
            placeholder="Email"
            type="email"
            formControlName="email"
          />
          @if(emailForm.get('email')?.hasError('required')) {
          <mat-error i18n>Email is required</mat-error>
          } @if(emailForm.get('email')?.hasError('email')) {
          <mat-error i18n>Invalid email format</mat-error>}
        </mat-form-field>
        <div class="buttons">
          <button mat-raised-button color="primary" type="submit" i18n>Send recovery email</button>
        </div>
        <div class="buttons">
          <button mat-button color="accent" type="button" (click)="toLogin()" i18n>Back to login</button>
        </div>
      </form>
    </div>
    }
  `,
  styles: `

  `,
})
export class PasswordRecoveryComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  loading = true;
  token: string | null = null;

  emailForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  passwordForm = new FormGroup(
    {
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

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.token = params['token'];
      this.loading = false;
    });
    this.route.queryParamMap.subscribe((params) => {
      if (params.has('email')) {
        this.emailForm.patchValue({ email: params.get('email') });
      }
    });
  }

  onEmailSubmit() {
    if (this.emailForm.invalid) {
      this.notificationService.warn($localize`Invalid email`);
      return;
    }

    this.authService
      .requestPasswordRecovery(this.emailForm.value.email!)
      .then(() => {
        this.notificationService.confirm($localize`Recovery email sent`);
      })
      .catch((error) => {
        this.notificationService.error($localize`Error sending recovery email`);
      });
  }

  onPasswordSubmit() {
    if (this.passwordForm.invalid) {
      this.notificationService.warn($localize`Invalid form data`);
      return;
    }

    this.authService
      .finalizePasswordRecovery(
        this.token!,
        this.passwordForm.value.new_password!
      )
      .then(() => {
        this.notificationService.confirm($localize`Password updated`);
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        this.notificationService.error($localize`Error updating password`);
      });
  }

  toLogin() {
    this.router.navigate(['/login']);
  }
}
