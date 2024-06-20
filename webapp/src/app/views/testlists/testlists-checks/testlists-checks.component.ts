import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
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
import { TestcheckDto } from '../../../services/testchecks/testchecks.model';
import { TestchecksService } from '../../../services/testchecks/testchecks.service';
import { TestlistDto } from '../../../services/testlists/testlists.model';
import { AlertMessageComponent } from '../../../widgets/alert-message/alert-message.component';
import { ConfirmDialogComponent } from '../../../widgets/confirm-dialog/confirm-dialog.component';
import { SectionTitleComponent } from '../../../widgets/section-title/section-title.component';
import { TestchecksEditComponent } from '../../testchecks/testchecks-edit/testchecks-edit.component';

@Component({
  selector: 'app-testlists-checks',
  standalone: true,
  imports: [
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    AlertMessageComponent,
    CdkDropList,
    CdkDrag,
    SectionTitleComponent,
  ],
  template: `
    <app-section-title
      ><span i18n>Tests</span>
      <button
        mat-raised-button
        color="primary"
        (click)="createTestcheck()"
        tool
      >
        <mat-icon>add</mat-icon>
        <span i18n>Add Test</span>
      </button>
    </app-section-title>
    <mat-table
      #table
      class="mat-elevation-z2"
      cdkDropList
      [dataSource]="testchecks"
      cdkDropListData="dataSource"
      (cdkDropListDropped)="drop($event)"
    >
      <ng-container matColumnDef="position" sticky>
        <mat-header-cell *matHeaderCellDef class="td-drag"></mat-header-cell>
        <mat-cell *matCellDef="let item" class="td-drag">
          <mat-icon class="drag-cursor">reorder</mat-icon>
          {{ item.position }}
        </mat-cell>
      </ng-container>
      <ng-container matColumnDef="name">
        <mat-header-cell *matHeaderCellDef i18n>Name</mat-header-cell>
        <mat-cell *matCellDef="let item">{{ item.name }}</mat-cell>
      </ng-container>
      <ng-container matColumnDef="description">
        <mat-header-cell *matHeaderCellDef i18n>Description</mat-header-cell>
        <mat-cell *matCellDef="let item"
          ><div [innerHTML]="item.description"></div
        ></mat-cell>
      </ng-container>
      <ng-container matColumnDef="expected">
        <mat-header-cell *matHeaderCellDef i18n>Expected</mat-header-cell>
        <mat-cell *matCellDef="let item"
          ><div [innerHTML]="item.expected"></div
        ></mat-cell>
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
          <button mat-icon-button (click)="editCheck(item)">
            <mat-icon>edit</mat-icon>
          </button>
          <button mat-icon-button color="warn" (click)="deleteCheck(item)">
            <mat-icon>delete</mat-icon>
          </button>
        </mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
      <mat-row
        *matRowDef="let row; columns: displayedColumns"
        cdkDrag
        [cdkDragData]="row"
      ></mat-row>
    </mat-table>
    @if(!testchecks.length) {
    <app-alert-message>No tests found</app-alert-message>
    }
  `,
  styles: `
    table {
      width: 100%;
    }

    .drag-cursor {
      margin-right: 16px;
      cursor: move;
    }

    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
        0 8px 10px 1px rgba(0, 0, 0, 0.14),
        0 3px 14px 2px rgba(0, 0, 0, 0.12);
      background-color: white;
    }

    .cdk-drag-placeholder {
      opacity: 0;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drop-list-dragging .mat-row:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `,
})
export class TestlistsChecksComponent implements OnInit, OnChanges {
  private dialog = inject(MatDialog);
  private notificationService = inject(NotificationService);
  private testchecksService = inject(TestchecksService);

  @Input() testlist?: TestlistDto;
  @ViewChild('table', { static: false }) table!: MatTable<TestcheckDto>;

  displayedColumns: string[] = [
    'position',
    'name',
    'tags',
    'description',
    'expected',
    'tools',
  ];

  testchecks: TestcheckDto[] = [];

  ngOnInit(): void {
    this.refresh();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['testlist'] && !changes['testlist'].firstChange) {
      this.refresh();
    }
  }

  refresh() {
    if (!this.testlist) {
      return;
    }
    this.testchecksService
      .getTestlistChecks(this.testlist._id)
      .then((testchecks) => {
        this.testchecks = testchecks;
      })
      .catch((err) => {
        console.error(err);
        this.notificationService.error(
          $localize`Failed to load testlist checks`
        );
      });
  }

  drop(event: CdkDragDrop<string>) {
    if (!this.testlist) {
      return;
    }
    const previousIndex = this.testchecks.findIndex(
      (d) => d === event.item.data
    );
    moveItemInArray(this.testchecks, previousIndex, event.currentIndex);
    this.table.renderRows();
    this.saveSorting();
  }

  createTestcheck() {
    this.dialog
      .open(TestchecksEditComponent, { minWidth: '720px' })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.testchecksService
            .createTestcheck(this.testlist!._id, res)
            .then(() => {
              this.notificationService.confirm($localize`Test created`);
              this.refresh();
            })
            .catch(() => {
              this.notificationService.error($localize`Failed to create test`);
            });
        }
      });
  }

  editCheck(testcheck: TestcheckDto) {
    this.dialog
      .open(TestchecksEditComponent, {
        minWidth: '720px',
        data: testcheck,
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.testchecksService
            .updateTestcheck(testcheck._id, res)
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

  deleteCheck(testcheck: TestcheckDto) {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: $localize`Delete test`,
          message: $localize`Are you sure you want to delete this test?`,
        },
      })
      .afterClosed()
      .subscribe((res) => {
        if (res) {
          this.testchecksService
            .deleteTestcheck(testcheck._id)
            .then(() => {
              this.notificationService.confirm($localize`Test deleted`);
              this.refresh();
            })
            .catch(() => {
              this.notificationService.error($localize`Failed to delete test`);
            });
        }
      });
  }

  saveSorting() {
    this.testchecksService
      .updateTestchecksPositions(
        this.testlist!._id,
        this.testchecks.map((d) => d._id)
      )
      .then(() => {
        this.notificationService.confirm($localize`Test checks updated`);
        for (let i = 0; i < this.testchecks.length; i++) {
          this.testchecks[i].position = i + 1;
        }
      })
      .catch(() => {
        this.notificationService.error($localize`Failed to update test checks`);
      });
  }
}
