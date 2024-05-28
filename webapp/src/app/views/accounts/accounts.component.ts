import { DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime } from 'rxjs';
import { NotificationService } from '../../services/notification/notification.service';
import {
  AccountDto,
  AccountsListRequest,
} from '../../services/accounts/accounts.model';
import { AccountsService } from '../../services/accounts/accounts.service';
import { AlertMessageComponent } from '../../widgets/alert-message/alert-message.component';
import { PageTitleComponent } from '../../widgets/page-title/page-title.component';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    PageTitleComponent,
    MatTableModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    AlertMessageComponent,
    MatIconModule,
    MatButtonModule,
    RouterModule,
    DatePipe,
  ],
  styles: [``],
  template: `
    <app-page-title icon="account_work"
      ><span i18n>Accounts</span>
      <button mat-icon-button routerLink="/accounts/create" tool>
        <mat-icon>add</mat-icon>
      </button>
    </app-page-title>
    <div class="table-filters">
      <mat-form-field>
        <mat-label>Filter</mat-label>
        <input
          matInput
          (input)="applyFilter()"
          placeholder="Search text ..."
          #filter
        />
      </mat-form-field>

      <mat-paginator
        [pageSizeOptions]="[10, 25, 100]"
        showFirstLastButtons
        (page)="refreshAccounts()"
      ></mat-paginator>
    </div>
    <table
      mat-table
      [dataSource]="list"
      matSort
      matSortActive="name"
      matSortDirection="asc"
      matSortDisableClear
      (matSortChange)="refreshAccounts()"
    >
      <ng-container matColumnDef="name">
        <th mat-header-cell mat-sort-header *matHeaderCellDef i18n>Name</th>
        <td mat-cell *matCellDef="let account">{{ account.name }}</td>
      </ng-container>
      <ng-container matColumnDef="created_at">
        <th mat-header-cell mat-sort-header *matHeaderCellDef i18n>
          Created At
        </th>
        <td mat-cell *matCellDef="let account">
          {{ account.created_at | date : 'medium' }}
        </td>
      </ng-container>
      <ng-container matColumnDef="updated_at">
        <th mat-header-cell mat-sort-header *matHeaderCellDef i18n>
          Updated At
        </th>
        <td mat-cell *matCellDef="let account">
          {{ account.updated_at | date : 'medium' }}
        </td>
      </ng-container>
      <ng-container matColumnDef="tools">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let account" class="td-tools">
          <button mat-icon-button (click)="viewDetail(account)">
            <mat-icon>pageview</mat-icon>
          </button>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>

      <!-- Row shown when there is no matching data. -->
      <tr class="mat-row" *matNoDataRow>
        <td class="mat-cell" colspan="5">
          <app-alert-message>No data matching the filter</app-alert-message>
        </td>
      </tr>
    </table>
  `,
})
export class AccountsComponent implements AfterViewInit {
  private router = inject(Router);
  private accountsService = inject(AccountsService);
  private notificationService = inject(NotificationService);

  displayedColumns: string[] = ['name', 'created_at', 'updated_at', 'tools'];
  list: AccountDto[] = [];
  total = 0;

  private filterSubject = new Subject<string>();

  @ViewChild('filter') filter!: ElementRef<HTMLInputElement>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    this.filterSubject.pipe(debounceTime(500)).subscribe((q) => {
      if (q.length > 2 || q.length === 0) {
        this.refreshAccounts();
      }
    });
  }

  ngAfterViewInit(): void {
    this.refreshAccounts();
  }

  applyFilter() {
    this.filterSubject.next(this.filter.nativeElement.value);
  }

  refreshAccounts(): void {
    const request: AccountsListRequest = {
      page: this.paginator.pageIndex,
      per_page: this.paginator.pageSize,
      sort_by: this.sort.active,
      sort_dir: this.sort.direction,
      q: this.filter.nativeElement.value || undefined,
    };

    this.accountsService
      .getAccountsList(request)
      .then((res) => {
        this.list = res.list;
        this.total = res.total;
        this.paginator.length = this.total;
      })
      .catch(() => {
        this.notificationService.error($localize`Failed to fetch accounts`);
      });
  }

  viewDetail(account: AccountDto): void {
    this.router.navigate([`/accounts/detail`, account._id]);
  }
}
