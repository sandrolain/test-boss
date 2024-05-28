import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../services/notification/notification.service';
import { AccountDto } from '../../../services/accounts/accounts.model';
import { AccountsService } from '../../../services/accounts/accounts.service';
import { ConfirmDialogComponent } from '../../../widgets/confirm-dialog/confirm-dialog.component';
import { PageTitleComponent } from '../../../widgets/page-title/page-title.component';
import { SectionTitleComponent } from '../../../widgets/section-title/section-title.component';
import { AccountsMembersComponent } from '../accounts-members/accounts-members.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-accounts-detail',
  standalone: true,
  imports: [
    PageTitleComponent,
    SectionTitleComponent,
    AccountsMembersComponent,
    MatIconModule,
    MatButtonModule,
    DatePipe,
  ],
  template: `
    <app-page-title icon="account_work" [back]="['/accounts']">
      {{ pageTitle }} {{ account?.name }}
      <button mat-icon-button (click)="editAccount()" tool>
        <mat-icon>edit</mat-icon>
      </button>
      <button mat-icon-button color="warn" (click)="deleteAccount()" tool>
        <mat-icon>delete_forever</mat-icon>
      </button>
    </app-page-title>
    <div class="profile">
      <div class="profile-details">
        <div class="profile-field">
          <label>ID:</label>
          <span>{{ account?._id }}</span>
        </div>
        <div class="profile-field">
          <label i18n>Name:</label>
          <span>{{ account?.name }}</span>
        </div>
        <div class="profile-field">
          <label i18n>Created At:</label>
          <span>{{ account?.created_at | date : 'medium' }}</span>
        </div>
        <div class="profile-field">
          <label i18n>UpdatedAt:</label>
          <span>{{ account?.updated_at | date : 'medium' }}</span>
        </div>
      </div>
    </div>
    @if(account?._id) {
    <app-section-title i18n>Account Members</app-section-title>
    <app-accounts-members
      [accountId]="account?._id || ''"
    ></app-accounts-members>
    }
  `,
  styles: ``,
})
export class AccountsDetailComponent implements OnInit {
  private accountService = inject(AccountsService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  pageTitle = $localize`Account:`;
  account?: AccountDto;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.accountService
        .getAccount(id)
        .then((account) => {
          this.account = account;
        })
        .catch((err) => {
          this.notificationService.error(
            $localize`Failed to load user-account`
          );
        });
    });
  }

  editAccount() {
    this.router.navigate(['/accounts/edit', this.account!._id]);
  }

  deleteAccount() {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: $localize`Delete Account`,
          message: $localize`Are you sure you want to delete this user account?`,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.accountService
            .deleteAccount(this.account!._id)
            .then(() => {
              this.notificationService.confirm($localize`Account deleted`);
              this.router.navigate(['/accounts']);
            })
            .catch((err) => {
              this.notificationService.error(
                $localize`Failed to delete user-account`
              );
            });
        }
      });
  }
}
