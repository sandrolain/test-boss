import { Component, OnInit, inject } from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { UserImagePipe } from '../../../pipes/user-image.pipe';
import { AuthService } from '../../../services/auth/auth.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { AccountsService } from '../../../services/accounts/accounts.service';
import { UserDto } from '../../../services/users/users.model';
import { UsersService } from '../../../services/users/users.service';
import { ConfirmDialogComponent } from '../../../widgets/confirm-dialog/confirm-dialog.component';
import { PageTitleComponent } from '../../../widgets/page-title/page-title.component';
import { DatePipe } from '@angular/common';
import { LoginUserAccount } from '../../../services/auth/login.model';

@Component({
  selector: 'app-users-detail',
  standalone: true,
  imports: [
    PageTitleComponent,
    UserImagePipe,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatBadgeModule,
    DatePipe,
  ],
  template: `
    <app-page-title icon="people" [back]="['/users']">
      {{ pageTitle }} {{ user?.firstname }} {{ user?.lastname }}
      <button mat-icon-button (click)="editUser()" tool>
        <mat-icon>edit</mat-icon>
      </button>
      <button mat-icon-button color="warn" (click)="deleteUser()" tool>
        <mat-icon>delete_forever</mat-icon>
      </button>
    </app-page-title>
    <div class="profile">
      <div class="profile-image">
        <img [src]="image | userImage" alt="Profile Image" />
      </div>
      <div class="profile-details">
        <div class="profile-field">
          <label i18n>ID:</label>
          <span>{{ user?._id }}</span>
        </div>
        <div class="profile-field">
          <label i18n>Firstname:</label>
          <span>{{ user?.firstname }}</span>
        </div>
        <div class="profile-field">
          <label i18n>Lastname:</label>
          <span>{{ user?.lastname }}</span>
        </div>
        <div class="profile-field">
          <label i18n>Email:</label>
          <span>{{ user?.email }}</span>
        </div>
        <div class="profile-field">
          <label i18n>Created At:</label>
          <span>{{ user?.created_at | date : 'medium' }}</span>
        </div>
        <div class="profile-field">
          <label i18n>Updated At:</label>
          <span>{{ user?.updated_at | date : 'medium' }}</span>
        </div>
        <div class="profile-field">
          <label i18n>Accounts:</label>
          <div class="chips">
            <mat-chip-set>
              @for (account of accounts; track account) {
              <mat-chip>{{ account.name }}</mat-chip>
              }
            </mat-chip-set>
            <button mat-icon-button (click)="editAccounts()">
              <mat-icon>edit</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class UsersDetailComponent implements OnInit {
  private userService = inject(UsersService);
  private accountService = inject(AccountsService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  pageTitle = $localize`User:`;
  user?: UserDto;
  image?: string;
  accounts: LoginUserAccount[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.userService
        .getUser(id)
        .then((user) => {
          this.user = user;
        })
        .catch((err) => {
          this.notificationService.error($localize`Failed to load user`);
        });
      this.userService
        .getUserImage(id)
        .then((res) => {
          this.image = res.image;
        })
        .catch(() => {
          this.notificationService.error($localize`Failed to load user image`);
        });
    });
  }

  editUser() {
    this.router.navigate(['/users/edit', this.user!._id]);
  }

  editAccounts() {
    this.router.navigate(['/users/edit', this.user!._id, 'accounts']);
  }

  deleteUser() {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: $localize`Delete User`,
          message: $localize`Are you sure you want to delete this user?`,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.userService
            .deleteUser(this.user!._id)
            .then(() => {
              this.notificationService.confirm($localize`User deleted`);
              this.router.navigate(['/users']);
            })
            .catch((err) => {
              this.notificationService.error($localize`Failed to delete user`);
            });
        }
      });
  }
}
