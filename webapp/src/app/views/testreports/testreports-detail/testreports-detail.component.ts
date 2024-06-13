import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../../services/notification/notification.service';
import { TestreportDto } from '../../../services/testreports/testreports.model';
import { TestreportsService } from '../../../services/testreports/testreports.service';
import { ConfirmDialogComponent } from '../../../widgets/confirm-dialog/confirm-dialog.component';
import {
  DetailsBoxComponent,
  DetailsBoxField,
} from '../../../widgets/details-box/details-box.component';
import { PageTitleComponent } from '../../../widgets/page-title/page-title.component';
import { TestreportsEditComponent } from '../testreports-edit/testreports-edit.component';
import { TestreportsResultsComponent } from '../testreports-results/testreports-results.component';

@Component({
  selector: 'app-testreports-detail',
  standalone: true,
  imports: [
    PageTitleComponent,
    TestreportsResultsComponent,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    DetailsBoxComponent,
  ],
  template: `
    <app-page-title
      icon="quiz"
      [back]="['/projects/detail', testreport?.project_id]"
    >
      {{ pageTitle }} {{ title }}
      <button mat-icon-button (click)="editTestreport()" tool>
        <mat-icon>edit</mat-icon>
      </button>
      <button mat-icon-button color="warn" (click)="deleteTestreport()" tool>
        <mat-icon>delete_forever</mat-icon>
      </button>
    </app-page-title>

    <app-details-box [fields]="detailsFields"></app-details-box>

    <app-testreports-results
      [testreport]="testreport"
    ></app-testreports-results>
  `,
  styles: ``,
})
export class TestreportsDetailComponent implements OnInit {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private testreportsService = inject(TestreportsService);

  pageTitle = $localize`Test Report: `;
  title = '';

  private testreportId!: string;
  testreport?: TestreportDto;

  detailsFields: DetailsBoxField[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.testreportId = params['id'];
      this.refresh();
    });
  }

  refresh() {
    this.testreportsService
      .getTestreport(this.testreportId)
      .then((testreport) => {
        this.testreport = testreport;
        this.title = testreport.name;
        this.updateDetails();
      })
      .catch((err) => {
        console.error(err);
        this.notificationService.error($localize`Failed to get testreport`);
      });
  }

  updateDetails() {
    this.detailsFields = [
      { label: $localize`ID`, value: this.testreport?._id },
      { label: $localize`Name`, value: this.testreport?.name },
      { label: $localize`Description`, value: this.testreport?.description },
      {
        label: $localize`Created At`,
        value: this.testreport?.created_at
          ? new Date(this.testreport.created_at)
          : null,
      },
      {
        label: $localize`Updated At`,
        value: this.testreport?.updated_at
          ? new Date(this.testreport.updated_at)
          : null,
      },
    ];
  }

  editTestreport() {
    const data = this.testreport!;
    this.dialog
      .open(TestreportsEditComponent, { data, minWidth: '720px' })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.testreportsService
            .updateTestreport(data._id, res)
            .then(() => {
              this.notificationService.confirm($localize`Testreport updated`);
              this.refresh();
            })
            .catch(() => {
              this.notificationService.error(
                $localize`Failed to update testreport`
              );
            });
        }
      });
  }

  deleteTestreport() {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: $localize`Delete Testreport`,
          message: $localize`Are you sure you want to delete this testreport?`,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.testreportsService
            .deleteTestreport(this.testreport!._id)
            .then(() => {
              this.router.navigate([
                '/projects/detail',
                this.testreport!.project_id,
              ]);
            })
            .catch((err) => {
              console.error(err);
              this.notificationService.error(
                $localize`Failed to delete testreport`
              );
            });
        }
      });
  }
}
