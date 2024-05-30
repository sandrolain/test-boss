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
import { semverValidator, urlValidator } from '../../../lib/validators';
import { AuthService } from '../../../services/auth/auth.service';
import { NotificationService } from '../../../services/notification/notification.service';
import {
  ProjectDto,
  ProjectEditDto,
} from '../../../services/projects/projects.model';
import { ProjectsService } from '../../../services/projects/projects.service';
import { PageTitleComponent } from '../../../widgets/page-title/page-title.component';

@Component({
  selector: 'app-projects-edit',
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
      [back]="projectId ? ['/projects/detail', projectId] : ['/projects']"
      >{{ pageTitle }} {{ title }}</app-page-title
    >
    <div class="crud-form">
      <form [formGroup]="projectForm" (ngSubmit)="onSubmit()">
        <mat-form-field size="1:2">
          <input matInput placeholder="Name" formControlName="name" />
          @if(projectForm.get('name')?.hasError('required')) {
          <mat-error i18n>Name is required</mat-error>}
        </mat-form-field>
        <mat-form-field size="1:2">
          <input matInput placeholder="Version" formControlName="version" />
          @if(projectForm.get('version')?.hasError('required')) {
          <mat-error i18n>Version is required</mat-error>}
          @if(projectForm.get('version')?.hasError('invalidSemver')) {
          <mat-error i18n>Version must be a valid semantic version</mat-error>}
        </mat-form-field>
        <mat-form-field>
          <input
            matInput
            placeholder="Description"
            formControlName="description"
          />
        </mat-form-field>
        <mat-form-field>
          <input
            matInput
            placeholder="Repository URL"
            formControlName="repository"
          />
          @if(projectForm.get('repository')?.hasError('invalidRepository')) {
          <mat-error i18n>Repository must be a valid URL</mat-error>}
        </mat-form-field>
        <button mat-raised-button color="primary" type="submit" i18n>
          Save
        </button>
      </form>
    </div>
  `,
  styles: ``,
})
export class ProjectsEditComponent {
  private authService = inject(AuthService);
  private projectService = inject(ProjectsService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  projectForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    version: new FormControl('', [Validators.required, semverValidator]),
    description: new FormControl('', []),
    repository: new FormControl('', [urlValidator]),
  });

  projectId?: string;
  project?: ProjectDto;
  pageTitle = $localize`Create Project`;
  title = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.projectId = params['id'];
      if (this.projectId) {
        this.pageTitle = $localize`Edit Project: `;
        this.projectService
          .getProject(this.projectId)
          .then((project) => {
            this.title = `${project.name} v${project.version}`;
            this.project = project;
            this.projectForm.patchValue(project);
          })
          .catch((err) => {
            this.notificationService.error($localize`Failed to load project`);
          });
      }
    });
  }

  onSubmit() {
    if (this.projectForm.invalid) {
      this.notificationService.error(
        $localize`Please fill in all required fields`
      );
      return;
    }

    if (this.projectId) {
      this.projectService
        .updateProject(
          this.project!._id,
          this.projectForm.value as ProjectEditDto
        )
        .then(() => {
          this.notificationService.confirm($localize`Project updated`);
          this.router.navigate(['/projects/detail', this.project!._id]);
        })
        .catch(() => {
          this.notificationService.error($localize`Failed to update project`);
        });
    } else {
      const account_id = this.authService.account()?._id;

      if (!account_id) {
        this.notificationService.error($localize`Failed to create project`);
        return;
      }

      this.projectService
        .createProject(account_id, this.projectForm.value as ProjectEditDto)
        .then(() => {
          this.notificationService.confirm($localize`Project created`);
          this.router.navigate(['/projects/detail', this.project!._id]);
        })
        .catch(() => {
          this.notificationService.error($localize`Failed to create project`);
        });
    }
  }
}
