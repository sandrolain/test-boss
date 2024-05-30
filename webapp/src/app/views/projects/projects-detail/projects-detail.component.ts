import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../services/notification/notification.service';
import { ProjectDto } from '../../../services/projects/projects.model';
import { ProjectsService } from '../../../services/projects/projects.service';
import { ConfirmDialogComponent } from '../../../widgets/confirm-dialog/confirm-dialog.component';
import { PageTitleComponent } from '../../../widgets/page-title/page-title.component';
import { ProjectsTestlistsComponent } from '../projects-testlists/projects-testlists.component';

@Component({
  selector: 'app-projects-detail',
  standalone: true,
  imports: [
    PageTitleComponent,
    ProjectsTestlistsComponent,
    MatIconModule,
    MatButtonModule,
    DatePipe,
  ],
  template: `
    <app-page-title icon="project_work" [back]="['/projects']">
      {{ pageTitle }} {{ title }}
      <button mat-icon-button (click)="editProject()" tool>
        <mat-icon>edit</mat-icon>
      </button>
      <button mat-icon-button color="warn" (click)="deleteProject()" tool>
        <mat-icon>delete_forever</mat-icon>
      </button>
    </app-page-title>
    <div class="profile">
      <div class="profile-details">
        <div class="profile-field">
          <label>ID:</label>
          <span>{{ project?._id }}</span>
        </div>
        <div class="profile-field">
          <label i18n>Name:</label>
          <span>{{ project?.name }}</span>
        </div>
        <div class="profile-field">
          <label i18n>Version:</label>
          <span>{{ project?.version }}</span>
        </div>
        <div class="profile-field">
          <label i18n>Description:</label>
          <span>{{ project?.description }}</span>
        </div>
        <div class="profile-field">
          <label i18n>Repository:</label>
          <span
            >@if (project?.repository) {
            <a
              [href]="project?.repository"
              target="_blank"
              rel="noopener noreferrer"
              >{{ project?.repository }}</a
            >
            } @else {
            <span>N/A</span>
            }
          </span>
        </div>
        <div class="profile-field">
          <label i18n>Created At:</label>
          <span>{{ project?.created_at | date : 'medium' }}</span>
        </div>
        <div class="profile-field">
          <label i18n>UpdatedAt:</label>
          <span>{{ project?.updated_at | date : 'medium' }}</span>
        </div>
      </div>
    </div>
    @if(project?._id) {
    <app-projects-testlists
      [projectId]="project?._id || ''"
    ></app-projects-testlists>
    }
  `,
  styles: ``,
})
export class ProjectsDetailComponent implements OnInit {
  private projectService = inject(ProjectsService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  project?: ProjectDto;
  pageTitle = $localize`Project:`;
  title = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.projectService
        .getProject(id)
        .then((project) => {
          this.project = project;
          this.title = `${project.name} v${project.version}`;
        })
        .catch((err) => {
          this.notificationService.error(
            $localize`Failed to load user-project`
          );
        });
    });
  }

  editProject() {
    this.router.navigate(['/projects/edit', this.project!._id]);
  }

  deleteProject() {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: $localize`Delete Project`,
          message: $localize`Are you sure you want to delete this user project?`,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.projectService
            .deleteProject(this.project!._id)
            .then(() => {
              this.notificationService.confirm($localize`Project deleted`);
              this.router.navigate(['/projects']);
            })
            .catch((err) => {
              this.notificationService.error(
                $localize`Failed to delete user-project`
              );
            });
        }
      });
  }
}
