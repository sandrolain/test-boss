import { Component, Input, OnInit, ViewChild, inject } from '@angular/core';
import { TestlistDto } from '../../../services/testlists/testlists.model';
import { MatTable, MatTableModule } from '@angular/material/table';
import { AlertMessageComponent } from '../../../widgets/alert-message/alert-message.component';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import {
  CdkDragDrop,
  CdkDropList,
  CdkDrag,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { TestlistsService } from '../../../services/testlists/testlists.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { MatButtonModule } from '@angular/material/button';
import { TestchecksService } from '../../../services/testchecks/testchecks.service';
import { TestcheckDto } from '../../../services/testchecks/testchecks.model';

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
  ],
  template: `
    <mat-table
      #table
      class="mat-elevation-z8"
      cdkDropList
      [dataSource]="testchecks"
      cdkDropListData="dataSource"
      (cdkDropListDropped)="drop($event)"
    >
      <ng-container matColumnDef="position" sticky>
        <mat-header-cell *matHeaderCellDef></mat-header-cell>
        <mat-cell *matCellDef="let item">
          <mat-icon class="example-drag-cursor">reorder</mat-icon>
        </mat-cell>
      </ng-container>

      <ng-container matColumnDef="id">
        <mat-header-cell *matHeaderCellDef i18n>ID</mat-header-cell>
        <mat-cell *matCellDef="let item">{{ item._id }}</mat-cell>
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

      <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
      <mat-row
        *matRowDef="let row; columns: displayedColumns"
        cdkDrag
        [cdkDragData]="row"
      ></mat-row>

      <!-- Row shown when there is no matching data. -->
      <tr class="mat-row" *matNoDataRow>
        <mat-cell class="mat-cell" colspan="7">
          <app-alert-message>No data matching the filter</app-alert-message>
        </mat-cell>
      </tr>
    </mat-table>

    <button mat-raised-button color="primary" (click)="create()">
      <mat-icon>add</mat-icon>
      <span i18n>Add</span>
    </button>
  `,
  styles: `
    table {
      width: 100%;
    }

    .example-drag-cursor {
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
export class TestlistsChecksComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private testchecksService = inject(TestchecksService);

  @Input() testlist?: TestlistDto;
  @ViewChild('table', { static: false }) table!: MatTable<TestcheckDto>;

  displayedColumns: string[] = [
    'position',
    'id',
    'name',
    'description',
    'expected',
    'tags',
  ];

  testchecks: TestcheckDto[] = [];

  ngOnInit(): void {
    if (!this.testlist) {
      return;
    }
    this.testchecksService
      .getTestlistChecks(this.testlist._id)
      .then((testchecks) => {
        this.testchecks = testchecks;
        this.table.renderRows();
      })
      .catch((err) => {
        console.error(err);
        this.notificationService.error($localize`Failed to load testchecks`);
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
    // TODO: save order
  }

  create() {
    if (!this.testlist) {
      return;
    }
    // this.testlistsService
    //   .createTestCheck(this.testlist._id)
    //   .then((testcheck) => {
    //     this.testchecks.push(testcheck);
    //     this.table.renderRows();
    //   })
    //   .catch((err) => {
    //     console.error(err);
    //     this.notificationService.error($localize`Failed to create testcheck`);
    //   });
  }
}
