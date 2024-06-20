import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTable, MatTableModule } from '@angular/material/table';
import { NotificationService } from '../../../services/notification/notification.service';
import { TestreportDto } from '../../../services/testreports/testreports.model';
import { TestresultDto } from '../../../services/testresults/testresults.model';
import { TestresultsService } from '../../../services/testresults/testresults.service';
import { AlertMessageComponent } from '../../../widgets/alert-message/alert-message.component';
import { SectionTitleComponent } from '../../../widgets/section-title/section-title.component';
import { TestresultsEditComponent } from '../../testresults/testresults-edit/testresults-edit.component';

@Component({
  selector: 'app-testreports-results',
  standalone: true,
  imports: [
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    AlertMessageComponent,
    SectionTitleComponent,
  ],
  template: `
    <app-section-title><span i18n>Tests</span> </app-section-title>
    <mat-table #table class="mat-elevation-z2" [dataSource]="testresults">
      <ng-container matColumnDef="position" sticky>
        <mat-header-cell *matHeaderCellDef class="td-drag"></mat-header-cell>
        <mat-cell *matCellDef="let item" class="td-drag">
          {{ item.position }}
        </mat-cell>
      </ng-container>
      <ng-container matColumnDef="name">
        <mat-header-cell *matHeaderCellDef i18n>Name</mat-header-cell>
        <mat-cell *matCellDef="let item">{{ item.name }}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="description">
        <mat-header-cell *matHeaderCellDef i18n>Description</mat-header-cell>
        <mat-cell *matCellDef="let item">{{ item.description }}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="expected">
        <mat-header-cell *matHeaderCellDef i18n>Expected</mat-header-cell>
        <mat-cell *matCellDef="let item">{{ item.expected }}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="tags">
        <mat-header-cell *matHeaderCellDef i18n>Tags</mat-header-cell>
        <mat-cell *matCellDef="let item">
          <mat-chip-set>
            @for(tag of item.tags; track tag) {
            <mat-chip>{{ tag }}</mat-chip>
            }
          </mat-chip-set>
        </mat-cell>
      </ng-container>
      <ng-container matColumnDef="tools">
        <mat-header-cell *matHeaderCellDef class="td-tools"></mat-header-cell>
        <mat-cell *matCellDef="let item" class="td-tools">
          <button mat-icon-button (click)="editResult(item)">
            <mat-icon>edit</mat-icon>
          </button>
        </mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: displayedColumns"></mat-row>
    </mat-table>
    @if(!testresults.length) {
    <app-alert-message>No tests found</app-alert-message>
    }
  `,
  styles: `
  `,
})
export class TestreportsResultsComponent implements OnInit, OnChanges {
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private testresultsService = inject(TestresultsService);

  @Input() testreport?: TestreportDto;
  @ViewChild('table', { static: false }) table!: MatTable<TestresultDto>;

  displayedColumns: string[] = [
    'position',
    'name',
    'description',
    'expected',
    'tags',
    'tools',
  ];

  testresults: TestresultDto[] = [];

  ngOnInit(): void {
    this.refresh();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['testreport'] && !changes['testreport'].firstChange) {
      this.refresh();
    }
  }

  refresh() {
    if (!this.testreport) {
      return;
    }
    this.testresultsService
      .getTestreportResults(this.testreport._id)
      .then((testresults) => {
        this.testresults = testresults;
      })
      .catch((err) => {
        console.error(err);
        this.notificationService.error(
          $localize`Failed to load testreport results`
        );
      });
  }

  editResult(testresult: TestresultDto) {
    this.dialog
      .open(TestresultsEditComponent, {
        minWidth: '720px',
        data: testresult,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.testresultsService
            .updateTestresult(testresult._id, res)
            .then(() => {
              this.notificationService.confirm($localize`Test updated`);
              this.refresh();
            })
            .catch(() => {
              this.notificationService.error($localize`Failed to update test`);
            });
        }
      });
  }
}
