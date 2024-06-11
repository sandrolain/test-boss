import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../services/notification/notification.service';
import { TestreportDto } from '../../../services/testreports/testreports.model';
import { TestreportsService } from '../../../services/testreports/testreports.service';
import { SectionTitleComponent } from '../../../widgets/section-title/section-title.component';
import { TestreportsEditComponent } from '../../testreports/testreports-edit/testreports-edit.component';

@Component({
  selector: 'app-projects-reports',
  standalone: true,
  imports: [
    MatGridListModule,
    MatCardModule,
    MatDividerModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    SectionTitleComponent,
    DatePipe,
  ],
  template: `
    <app-section-title
      ><span i18n>Project Test Reports</span>
      <button
        mat-raised-button
        color="primary"
        (click)="createTestreport()"
        tool
      >
        <mat-icon>add</mat-icon>
        <span i18n>Add testreport</span>
      </button>
    </app-section-title>
    <mat-grid-list cols="4" rowHeight="2:1">
      @for(testreport of testreports; track testreport) {
      <mat-grid-tile>
        <mat-card class="testreport">
          <mat-card-header>
            <mat-card-title>{{ testreport.name }}</mat-card-title>
            <mat-card-subtitle>{{
              testreport.created_at | date : 'medium'
            }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{ testreport.description }}</p>
            <mat-divider></mat-divider>
          </mat-card-content>
          <mat-card-actions align="end">
            <button
              mat-button
              i18n
              routerLink="/testreports/detail/{{ testreport._id }}"
            >
              OPEN
            </button>
          </mat-card-actions>
        </mat-card>
      </mat-grid-tile>
      }
    </mat-grid-list>
  `,
  styles: `
    mat-grid-list {
      margin: 8px;
    }
    .testreport {
      width: calc(100% - 16px);
      height: calc(100% - 16px);
      margin: 8px;
    }
  `,
})
export class ProjectsReportsComponent implements OnInit {
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private testreportsService = inject(TestreportsService);

  testreports: TestreportDto[] = [];

  @Input() projectId!: string;

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.testreportsService
      .getProjectTestreports(this.projectId)
      .then((testreports) => {
        this.testreports = testreports;
      })
      .catch((err) => {
        console.error(err);
        this.notificationService.error($localize`Failed to load testreports`);
      });
  }

  createTestreport() {
    this.dialog
      .open(TestreportsEditComponent, { minWidth: '720px' })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.testreportsService
            .createTestreport(this.projectId, res)
            .then(() => {
              this.notificationService.confirm($localize`Testreport created`);
              this.refresh();
            })
            .catch(() => {
              this.notificationService.error(
                $localize`Failed to create testreport`
              );
            });
        }
      });
  }
}
