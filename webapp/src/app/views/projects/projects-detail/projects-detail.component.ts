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
import {
  DetailsBoxComponent,
  DetailsBoxField,
} from '../../../widgets/details-box/details-box.component';
import { PageTitleComponent } from '../../../widgets/page-title/page-title.component';
import { ProjectsReportsComponent } from '../projects-reports/projects-reports.component';
import { ProjectsTestlistsComponent } from '../projects-testlists/projects-testlists.component';

@Component({
  selector: 'app-projects-detail',
  standalone: true,
  imports: [
    PageTitleComponent,
    ProjectsTestlistsComponent,
    ProjectsReportsComponent,
    MatIconModule,
    MatButtonModule,
    DatePipe,
    DetailsBoxComponent,
  ],
  template: `
    <app-page-title icon="group_work" [back]="['/projects']">
      {{ pageTitle }} {{ title }}
      <button mat-icon-button (click)="editProject()" tool>
        <mat-icon>edit</mat-icon>
      </button>
      <button mat-icon-button color="warn" (click)="deleteProject()" tool>
        <mat-icon>delete_forever</mat-icon>
      </button>
    </app-page-title>

    <app-details-box [fields]="detailsFields"></app-details-box>

    @if(project?._id) {
    <app-projects-testlists
      [projectId]="project?._id || ''"
    ></app-projects-testlists>
    <app-projects-reports
      [projectId]="project?._id || ''"
    ></app-projects-reports>
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

  detailsFields: DetailsBoxField[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      this.projectService
        .getProject(id)
        .then((project) => {
          this.project = project;
          this.title = `${project.name} v${project.version}`;
          this.updateDetails();
        })
        .catch((err) => {
          this.notificationService.error(
            $localize`Failed to load user-project`
          );
        });
    });
  }

  updateDetails() {
    this.detailsFields = [
      { label: $localize`ID`, value: this.project?._id },
      { label: $localize`Name`, value: this.project?.name },
      { label: $localize`Version`, value: this.project?.version },
      { label: $localize`Description`, value: this.project?.description },
      {
        label: $localize`Created At`,
        value: this.project?.created_at
          ? new Date(this.project.created_at)
          : null,
      },
      {
        label: $localize`Updated At`,
        value: this.project?.updated_at
          ? new Date(this.project.updated_at)
          : null,
      },
    ];
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
