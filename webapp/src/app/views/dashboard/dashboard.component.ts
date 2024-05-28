import { Component, OnInit, effect, inject } from '@angular/core';
import { PageTitleComponent } from '../../widgets/page-title/page-title.component';
import { RouterModule } from '@angular/router';
import { LoginUserAccount } from '../../services/auth/login.model';
import { AuthService } from '../../services/auth/auth.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { ProjectsService } from '../../services/projects/projects.service';
import { ProjectDto } from '../../services/projects/projects.model';
import { NotificationService } from '../../services/notification/notification.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    PageTitleComponent,
    RouterModule,
    MatDividerModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatGridListModule,
  ],
  styles: [
    `
      mat-grid-list {
        margin: 8px;
      }
      .project {
        width: calc(100% - 16px);
        height: calc(100% - 16px);
        margin: 8px;
      }
    `,
  ],
  template: `<app-page-title icon="dashboard"
      ><span i18n>Dashboard</span>

      <button
        mat-icon-button
        color="primary"
        routerLink="/projects/create"
        tool
      >
        <mat-icon>add</mat-icon>
      </button>
    </app-page-title>
    <mat-grid-list cols="3" rowHeight="2:1">
      @for(project of projects; track project) {
      <mat-grid-tile>
        <mat-card class="project">
          <mat-card-header>
            <mat-card-title>{{ project.name }}</mat-card-title>
            <mat-card-subtitle>{{ project.version }}</mat-card-subtitle>
            <mat-card-subtitle>{{ project.repository }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{ project.description }}</p>
            <mat-divider></mat-divider>
          </mat-card-content>
          <mat-card-actions>
            <button
              mat-button
              i18n
              routerLink="/projects/detail/{{ project._id }}"
            >
              OPEN
            </button>
            @if(project.repository) {
            <button mat-button i18n (click)="toRepository(project)">
              REPOSITORY
            </button>
            }
          </mat-card-actions>
        </mat-card>
      </mat-grid-tile>
      }
    </mat-grid-list>`,
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private projectsService = inject(ProjectsService);
  private notificationService = inject(NotificationService);
  account: LoginUserAccount | null = null;
  projects: ProjectDto[] = [];

  constructor() {
    effect(() => {
      this.account = this.authService.account();
      if (this.account) {
        this.projectsService
          .getAccountProjects(this.account._id)
          .then((projects) => (this.projects = projects))
          .catch(() => {
            this.notificationService.error($localize`Failed to load projects`);
          });
      }
    });
  }

  toRepository(project: ProjectDto) {
    window.open(project.repository, '_blank');
  }
}
