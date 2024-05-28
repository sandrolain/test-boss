import { Component, OnInit, ViewChild, effect, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import { LoginResponse, RoleID } from './services/auth/login.model';
import { NotificationService } from './services/notification/notification.service';
import { AccountsService } from './services/accounts/accounts.service';
import { ConfirmDialogComponent } from './widgets/confirm-dialog/confirm-dialog.component';
import { LoaderOverlayComponent } from './widgets/loader-overlay/loader-overlay.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,
    MatCardModule,
    MatListModule,
    RouterOutlet,
    LoaderOverlayComponent,
    RouterModule,
  ],
  template: `
    <div id="app">
      @if(ready) {
      <mat-toolbar color="primary">
        <div class="logo"><img src="assets/logo.jpeg" /></div>
        <span></span>
        @if(loggedIn) {
        <mat-card>
          <a routerLink="/profile">
            <mat-card-header>
              @if(image) {
              <img mat-card-avatar [src]="image" />
              } @else {
              <mat-icon mat-card-avatar>account_circle</mat-icon>
              }
              <mat-card-title>{{ fullName }}</mat-card-title>
              <mat-card-subtitle>{{ accounts }}</mat-card-subtitle>
            </mat-card-header>
          </a>
        </mat-card>
        <button mat-icon-button (click)="logout()" class="logout">
          <mat-icon>logout</mat-icon>
        </button>
        }
      </mat-toolbar>
      <mat-sidenav-container>
        <mat-sidenav mode="side" [opened]="navOpened">
          <mat-nav-list>
            @for (link of links; track link) {
            <a
              mat-list-item
              routerLink="{{ link.path }}"
              routerLinkActive="menu-active"
            >
              <span class="menu-row">
                <mat-icon matListIcon>{{ link.icon }}</mat-icon>
                <span>{{ link.title }}</span>
              </span>
            </a>
            @if (link.divider) {
            <mat-divider></mat-divider>
            } }
          </mat-nav-list>
        </mat-sidenav>
        <mat-sidenav-content>
          <router-outlet></router-outlet>
        </mat-sidenav-content>
      </mat-sidenav-container>
      } @else {
      <app-loader-overlay></app-loader-overlay>
      }
    </div>
  `,
  styles: [
    `
      #app {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: var(--mat-app-background-color);
      }
      mat-toolbar {
        .logo {
          height: calc(100% - 16px);

          img {
            height: 100%;
          }
        }
        span {
          flex: 1 1 auto;
        }
      }
      mat-sidenav-container {
        flex: 1 1 auto;
      }
      mat-sidenav {
        width: 200px;
      }
      mat-card {
        margin: 0 16px;

        a {
          color: inherit;
          text-decoration: none;
        }
        mat-icon {
          font-size: 40px;
        }

        [mat-card-avatar] {
          object-fit: cover;
          border-radius: 50%;
          width: 40px;
          height: 40px;
        }
      }

      .menu-row {
        display: flex;
        align-items: center;
      }
      .menu-row mat-icon {
        margin-right: 8px;
      }
      .menu-active {
        background: rgba(255, 255, 255, 0.1);
      }

      .logout {
        --mat-icon-color: var(--mat-app-background-color);
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private accountsService = inject(AccountsService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);

  title = 'Test Boss';

  ready = false;
  navOpened = false;
  loggedIn = false;
  user?: LoginResponse['user'];
  fullName?: string;
  accounts?: string;
  image?: string;

  private allLinks: MenuLink[] = [
    {
      path: '/dashboard',
      title: 'Dashboard',
      icon: 'dashboard',
      divider: true,
    },
    {
      path: '/users',
      title: 'Users',
      icon: 'people',
      roles: ['admin'],
    },
    {
      path: '/accounts',
      title: 'Accounts',
      icon: 'group_work',
      roles: ['admin'],
      divider: true,
    },
    { path: '/profile', title: 'Profile', icon: 'person' },
  ];

  links: MenuLink[] = [];

  @ViewChild(MatSidenav) sidenav!: MatSidenav;

  constructor() {
    effect(() => {
      const user = this.authService.loggedIn();
      this.loggedIn = !!user;
      if (this.loggedIn) {
        this.user = this.authService.getUser();
        this.fullName = `${this.user?.firstname} ${this.user?.lastname}`;
        this.image = this.authService.getImage();
        this.navOpened = true;
        this.accounts =
          this.authService
            .getAccounts()
            ?.map((a) => a.name)
            .join(',') ?? '';

        const roles = this.authService.getRoles() ?? [];
        this.links = this.allLinks.filter((link) => {
          if (!link.roles?.length) {
            return true;
          }
          return link.roles.every((p) => roles.includes(p));
        });
      } else {
        this.navOpened = false;
      }
    });
  }

  ngOnInit() {
    this.authService.loadLoginData().then(() => {
      this.ready = true;
    });
  }

  logout() {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: $localize`Logout`,
          message: $localize`Are you sure you want to logout?`,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.loggedIn = false;
          this.navOpened = false;
          this.authService.logout();
          this.router.navigate(['/login']);
          this.notificationService.confirm($localize`Logged out`);
        }
      });
  }
}

interface MenuLink {
  path: string;
  title: string;
  icon: string;
  divider?: boolean;
  roles?: RoleID[];
}
