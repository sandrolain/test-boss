import { Component, Input, OnInit, inject } from '@angular/core';
import { TestlistsService } from '../../../services/testlists/testlists.service';
import { TestlistDto } from '../../../services/testlists/testlists.model';
import { NotificationService } from '../../../services/notification/notification.service';
import { MatGridList, MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-projects-testlists',
  standalone: true,
  imports: [
    MatGridListModule,
    MatCardModule,
    MatDividerModule,
    RouterModule,
    MatButtonModule,
  ],
  template: ` <mat-grid-list cols="4" rowHeight="2:1">
    @for(testlist of testlists; track testlist) {
    <mat-grid-tile>
      <mat-card class="testlist">
        <mat-card-header>
          <mat-card-title>{{ testlist.name }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>{{ testlist.description }}</p>
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
  </mat-grid-list>`,
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
  private notificationService = inject(NotificationService);
  private testlistsService = inject(TestlistsService);

  testlists: TestlistDto[] = [];

  @Input() projectId!: string;

  ngOnInit() {
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
}
