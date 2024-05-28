import { Component, OnInit, inject } from '@angular/core';
import { PageTitleComponent } from '../../../widgets/page-title/page-title.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TestlistDto } from '../../../services/testlists/testlists.model';
import { TestlistsService } from '../../../services/testlists/testlists.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../services/notification/notification.service';
import { TestlistsChecksComponent } from '../testlists-checks/testlists-checks.component';

@Component({
  selector: 'app-testlists-detail',
  standalone: true,
  imports: [
    PageTitleComponent,
    TestlistsChecksComponent,
    MatButtonModule,
    MatIconModule,
    DatePipe,
  ],
  template: `
    <app-page-title icon="quiz" [back]="['/dashboard']">
      {{ pageTitle }} {{ title }}
      <button mat-icon-button (click)="editTestlist()" tool>
        <mat-icon>edit</mat-icon>
      </button>
      <button mat-icon-button color="warn" (click)="deleteTestlist()" tool>
        <mat-icon>delete_forever</mat-icon>
      </button>
    </app-page-title>
    <div class="profile">
      <div class="profile-details">
        <div class="profile-field">
          <label>ID:</label>
          <span>{{ testlist?._id }}</span>
        </div>
        <div class="profile-field">
          <label i18n>Name:</label>
          <span>{{ testlist?.name }}</span>
        </div>
        <div class="profile-field">
          <label i18n>Description:</label>
          <span>{{ testlist?.description }}</span>
        </div>
        <div class="profile-field">
          <label i18n>Created At:</label>
          <span>{{ testlist?.created_at | date : 'medium' }}</span>
        </div>
        <div class="profile-field">
          <label i18n>UpdatedAt:</label>
          <span>{{ testlist?.updated_at | date : 'medium' }}</span>
        </div>
      </div>
    </div>
    <app-testlists-checks [testlist]="testlist"></app-testlists-checks>
  `,
  styles: ``,
})
export class TestlistsDetailComponent implements OnInit {
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private testlistsService = inject(TestlistsService);

  pageTitle = $localize`Test List: `;
  title = '';

  testlist?: TestlistDto;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.testlistsService
        .getTestlist(params['id'])
        .then((testlist) => {
          this.testlist = testlist;
          this.title = testlist.name;
        })
        .catch((err) => {
          this.notificationService.error($localize`Failed to get testlist`);
        });
    });
  }

  editTestlist() {
    this.router.navigate(['/testlists/edit', this.testlist?._id]);
  }

  deleteTestlist() {
    this.testlistsService
      .deleteTestlist(this.testlist!._id)
      .then(() => {
        this.router.navigate(['/projects']);
      })
      .catch((err) => {
        this.notificationService.error($localize`Failed to delete testlist`);
      });
  }
}
