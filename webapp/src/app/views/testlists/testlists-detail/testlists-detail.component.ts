import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../services/notification/notification.service';
import { TestlistDto } from '../../../services/testlists/testlists.model';
import { TestlistsService } from '../../../services/testlists/testlists.service';
import { TestreportEditDto } from '../../../services/testreports/testreports.model';
import { ConfirmDialogComponent } from '../../../widgets/confirm-dialog/confirm-dialog.component';
import {
  DetailsBoxComponent,
  DetailsBoxField,
} from '../../../widgets/details-box/details-box.component';
import { PageTitleComponent } from '../../../widgets/page-title/page-title.component';
import { TestlistsChecksComponent } from '../testlists-checks/testlists-checks.component';
import { TestlistsEditComponent } from '../testlists-edit/testlists-edit.component';

@Component({
  selector: 'app-testlists-detail',
  standalone: true,
  imports: [
    PageTitleComponent,
    TestlistsChecksComponent,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    DetailsBoxComponent,
  ],
  template: `
    <app-page-title
      icon="quiz"
      [back]="['/projects/detail', testlist?.project_id]"
    >
      {{ pageTitle }} {{ title }}
      <button mat-icon-button (click)="createTestreport()" tool>
        <mat-icon>summarize</mat-icon>
      </button>
      <button mat-icon-button (click)="editTestlist()" tool>
        <mat-icon>edit</mat-icon>
      </button>
      <button mat-icon-button color="warn" (click)="deleteTestlist()" tool>
        <mat-icon>delete_forever</mat-icon>
      </button>
    </app-page-title>

    <app-details-box [fields]="detailsFields"></app-details-box>

    <app-testlists-checks [testlist]="testlist"></app-testlists-checks>
  `,
  styles: ``,
})
export class TestlistsDetailComponent implements OnInit {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private testlistsService = inject(TestlistsService);

  pageTitle = $localize`Test List: `;
  title = '';

  private testlistId!: string;
  testlist?: TestlistDto;

  detailsFields: DetailsBoxField[] = [];

  constructor(private route: ActivatedRoute) {}

  updateDetails() {
    this.detailsFields = [
      { label: $localize`ID`, value: this.testlist?._id },
      { label: $localize`Name`, value: this.testlist?.name },
      { label: $localize`Description`, value: this.testlist?.description },
      {
        label: $localize`Created At`,
        value: this.testlist?.created_at,
      },
      {
        label: $localize`UpdatedAt`,
        value: this.testlist?.updated_at,
      },
    ];
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.testlistId = params['id'];
      this.refresh();
    });
  }

  refresh() {
    this.testlistsService
      .getTestlist(this.testlistId)
      .then((testlist) => {
        this.testlist = testlist;
        this.title = testlist.name;
        this.updateDetails();
      })
      .catch((err) => {
        console.error(err);
        this.notificationService.error($localize`Failed to get testlist`);
      });
  }

  editTestlist() {
    const data = this.testlist!;
    this.dialog
      .open(TestlistsEditComponent, { data, minWidth: '720px' })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.testlistsService
            .updateTestlist(data._id, res)
            .then(() => {
              this.notificationService.confirm($localize`Testlist updated`);
              this.refresh();
            })
            .catch(() => {
              this.notificationService.error(
                $localize`Failed to update testlist`
              );
            });
        }
      });
  }

  deleteTestlist() {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: $localize`Delete Testlist`,
          message: $localize`Are you sure you want to delete this testlist?`,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.testlistsService
            .deleteTestlist(this.testlist!._id)
            .then(() => {
              this.router.navigate(['/projects']);
            })
            .catch((err) => {
              console.error(err);
              this.notificationService.error(
                $localize`Failed to delete testlist`
              );
            });
        }
      });
  }

  createTestreport() {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: $localize`Create Test Report`,
          message: $localize`Confirm to create a new test report?`,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          const data: TestreportEditDto = {
            name: this.testlist!.name,
            description: this.testlist!.description,
            execution: '', // TODO: setup form
          };

          this.testlistsService
            .createTestreport(this.testlist!._id, data)
            .then((data) => {
              this.router.navigate(['/testreports/detail', data._id]);
            })
            .catch((err) => {
              console.error(err);
              this.notificationService.error($localize``);
            });
        }
      });
  }
}
