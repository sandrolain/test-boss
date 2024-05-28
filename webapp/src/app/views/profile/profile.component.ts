import { Component, OnInit, effect, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule } from '@angular/router';
import { UserImagePipe } from '../../pipes/user-image.pipe';
import { AuthService } from '../../services/auth/auth.service';
import { NotificationService } from '../../services/notification/notification.service';
import { AccountsService } from '../../services/accounts/accounts.service';
import { UserDto } from '../../services/users/users.model';
import { UsersService } from '../../services/users/users.service';
import { ConfirmDialogComponent } from '../../widgets/confirm-dialog/confirm-dialog.component';
import {
  ImageCropDialogComponent,
  ImageCropDialogData,
} from '../../widgets/image-crop-dialog/image-crop-dialog.component';
import { LoaderOverlayComponent } from '../../widgets/loader-overlay/loader-overlay.component';
import { PageTitleComponent } from '../../widgets/page-title/page-title.component';
import { LoginUserAccount } from '../../services/auth/login.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    PageTitleComponent,
    UserImagePipe,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    LoaderOverlayComponent,
    MatChipsModule,
  ],
  template: `
    <app-page-title icon="person"
      ><span i18n>Profile</span>
      <button mat-icon-button routerLink="/profile/edit" tool>
        <mat-icon>edit</mat-icon>
      </button>
      <button mat-icon-button routerLink="/profile/password" tool>
        <mat-icon>password</mat-icon>
      </button>
      <button
        mat-icon-button
        [color]="deleteStep == 1 ? 'warn' : ''"
        tool
        (click)="onDelete()"
      >
        <mat-icon
          >{{ deleteStep == 1 ? 'delete_forever' : 'delete' }}
        </mat-icon>
      </button>
    </app-page-title>
    <div class="profile">
      <div class="profile-image">
        <img [src]="image | userImage" alt="Profile Image" />
        <div class="profile-btn">
          <input
            type="file"
            #imageInput
            hidden
            (change)="onFileSelect($event)"
            accept="image/*"
          />
          <button mat-mini-fab (click)="imageInput.click()">
            <mat-icon>edit</mat-icon>
          </button>
        </div>
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
          <label i18n>Accounts:</label>
          <mat-chip-set>
            @for (account of accounts; track account) {
            <mat-chip>{{ account.name }}</mat-chip>
            }
          </mat-chip-set>
        </div>
      </div>
    </div>
    @if (loading) {
    <app-loader-overlay></app-loader-overlay>
    }
  `,
  styles: `
    :host {
      display: block;
      position: relative;
    }
  `,
})
export class ProfileComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UsersService);
  private accountService = inject(AccountsService);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  loading = false;
  user?: UserDto;
  image?: string;
  accounts: LoginUserAccount[] = [];

  constructor() {
    effect(() => {
      const user = this.authService.loggedIn();
      if (user) {
        this.user = this.authService.getUser();
        this.image = this.authService.getImage();
      }
    });
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.image = this.authService.getImage();
    this.accounts = this.authService.getAccounts() ?? [];
  }

  onFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;

    this.dialog
      .open(ImageCropDialogComponent, {
        data: {
          title: $localize`Crop Image`,
          imageChangedEvent: event,
        } as ImageCropDialogData,
      })
      .afterClosed()
      .subscribe(async (res: Blob | undefined) => {
        target.value = '';
        if (res) {
          this.loading = true;
          try {
            await this.userService.updateUserImage(this.user!._id, res);
            await this.authService.updateSession();
            this.user = this.authService.getUser();
            this.image = this.authService.getImage();
          } catch (err) {
            console.error(err);
            this.notificationService.error(
              $localize`Failed to update user image`
            );
          }
          this.loading = false;
        }
      });
  }

  deleteStep = 0;

  onDelete() {
    switch (this.deleteStep) {
      case 0:
        this.deleteStep = 1;
        break;
      case 1:
        this.dialog
          .open(ConfirmDialogComponent, {
            data: {
              title: $localize`Delete Account`,
              message: $localize`Are you sure you want to delete your account?`,
            },
          })
          .afterClosed()
          .subscribe(async (res) => {
            this.deleteStep = 0;
            if (res) {
              this.loading = true;
              try {
                await this.userService.deleteUser(this.user!._id);
                this.authService.logout();
                this.router.navigate(['/login']);
              } catch (err) {
                console.error(err);
                this.notificationService.error(
                  $localize`Failed to delete user`
                );
              }
              this.loading = false;
            }
          });
    }
  }
}
