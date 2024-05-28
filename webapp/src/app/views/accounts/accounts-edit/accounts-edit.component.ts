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
import {
  AccountDto,
  AccountEditDto,
} from '../../../services/accounts/accounts.model';
import { AccountsService } from '../../../services/accounts/accounts.service';
import { PageTitleComponent } from '../../../widgets/page-title/page-title.component';

@Component({
  selector: 'app-accounts-edit',
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
      [back]="accountId ? ['/accounts/detail', accountId] : ['/accounts']"
      >{{ pageTitle }} {{ account?.name }}
    </app-page-title>
    <div class="crud-form">
      <form [formGroup]="accountForm" (ngSubmit)="onSubmit()">
        <mat-form-field>
          <input matInput placeholder="Name" formControlName="name" />
          @if(accountForm.get('name')?.hasError('required')) {
          <mat-error i18n>Name is required</mat-error>}
        </mat-form-field>
        <button mat-raised-button color="primary" type="submit" i18n>
          Save
        </button>
      </form>
    </div>
  `,
  styles: ``,
})
export class AccountsEditComponent {
  private accountService = inject(AccountsService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  accountForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
  });

  accountId?: string;
  account?: AccountDto;
  pageTitle = $localize`Create Account`;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.accountId = params['id'];
      if (this.accountId) {
        this.pageTitle = $localize`Edit Account: `;
        this.accountService
          .getAccount(this.accountId)
          .then((account) => {
            this.account = account;
            this.accountForm.patchValue(account);
          })
          .catch((err) => {
            this.notificationService.error(
              $localize`Failed to load user account`
            );
          });
      }
    });
  }

  onSubmit() {
    if (this.accountForm.invalid) {
      this.notificationService.error(
        $localize`Please fill in all required fields`
      );
      return;
    }

    if (this.accountId) {
      this.accountService
        .updateAccount(
          this.account!._id,
          this.accountForm.value as AccountEditDto
        )
        .then(() => {
          this.notificationService.confirm($localize`User account updated`);
          this.router.navigate(['/accounts']);
        })
        .catch(() => {
          this.notificationService.error(
            $localize`Failed to update user account`
          );
        });
    } else {
      this.accountService
        .createAccount(this.accountForm.value as AccountEditDto)
        .then(() => {
          this.notificationService.confirm($localize`User account created`);
          this.router.navigate(['/accounts']);
        })
        .catch(() => {
          this.notificationService.error(
            $localize`Failed to create user account`
          );
        });
    }
  }
}
