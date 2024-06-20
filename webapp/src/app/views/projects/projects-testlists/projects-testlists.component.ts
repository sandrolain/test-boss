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
import { TestlistDto } from '../../../services/testlists/testlists.model';
import { TestlistsService } from '../../../services/testlists/testlists.service';
import { SectionTitleComponent } from '../../../widgets/section-title/section-title.component';
import { TestlistsEditComponent } from '../../testlists/testlists-edit/testlists-edit.component';

@Component({
  selector: 'app-projects-testlists',
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
      ><span i18n>Project Testlists</span>
      <button mat-raised-button color="primary" (click)="createTestlist()" tool>
        <mat-icon>add</mat-icon>
        <span i18n>Add testlist</span>
      </button>
    </app-section-title>
    @if (testlists.length > 0) {
    <mat-grid-list cols="4" rowHeight="2:1">
      @for(testlist of testlists; track testlist) {
      <mat-grid-tile>
        <mat-card class="testlist">
          <mat-card-header>
            <mat-card-title>{{ testlist.name }}</mat-card-title>
            <mat-card-subtitle>{{
              testlist.created_at | date : 'medium'
            }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div [innerHTML]="testlist.description"></div>
            <mat-divider></mat-divider>
          </mat-card-content>
          <mat-card-actions align="end">
            <button
              mat-button
              i18n
              routerLink="/testlists/detail/{{ testlist._id }}"
            >
              OPEN
            </button>
          </mat-card-actions>
        </mat-card>
      </mat-grid-tile>
      }
    </mat-grid-list>
    } @else {
    <div i18n>No testlists found</div>
    }
  `,
  styles: `
    mat-grid-list {
      margin: 8px;
    }
    .testlist {
      width: calc(100% - 16px);
      height: calc(100% - 16px);
      margin: 8px;
    }
  `,
})
export class ProjectsTestlistsComponent implements OnInit {
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private testlistsService = inject(TestlistsService);

  testlists: TestlistDto[] = [];

  @Input() projectId!: string;

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.testlistsService
      .getProjectTestlists(this.projectId)
      .then((testlists) => {
        this.testlists = testlists;
      })
      .catch((err) => {
        console.error(err);
        this.notificationService.error($localize`Failed to load testlists`);
      });
  }

  createTestlist() {
    this.dialog
      .open(TestlistsEditComponent, { minWidth: '720px' })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.testlistsService
            .createTestlist(this.projectId, res)
            .then(() => {
              this.notificationService.confirm($localize`Testlist created`);
              this.refresh();
            })
            .catch(() => {
              this.notificationService.error(
                $localize`Failed to create testlist`
              );
            });
        }
      });
  }
}
