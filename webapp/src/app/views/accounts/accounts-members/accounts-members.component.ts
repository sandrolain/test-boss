import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
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
import { NotificationService } from '../../../services/notification/notification.service';
import { AccountsMembersListRequest } from '../../../services/accounts/accounts.model';
import { AccountsService } from '../../../services/accounts/accounts.service';
import { UserDto } from '../../../services/users/users.model';
import { AlertMessageComponent } from '../../../widgets/alert-message/alert-message.component';

@Component({
  selector: 'app-accounts-members',
  standalone: true,
  imports: [
    MatTableModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    AlertMessageComponent,
    MatIconModule,
    MatButtonModule,
    RouterModule,
  ],
  styles: [``],
  template: `
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
        (page)="refreshUsers()"
      ></mat-paginator>
    </div>
    <table
      mat-table
      [dataSource]="list"
      matSort
      matSortActive="firstname"
      matSortDirection="asc"
      matSortDisableClear
      (matSortChange)="refreshUsers()"
    >
      <ng-container matColumnDef="firstname">
        <th mat-header-cell mat-sort-header *matHeaderCellDef i18n>
          Firstname
        </th>
        <td mat-cell *matCellDef="let user">{{ user.firstname }}</td>
      </ng-container>
      <ng-container matColumnDef="lastname">
        <th mat-header-cell mat-sort-header *matHeaderCellDef i18n>Lastname</th>
        <td mat-cell *matCellDef="let user">{{ user.lastname }}</td>
      </ng-container>
      <ng-container matColumnDef="email">
        <th mat-header-cell mat-sort-header *matHeaderCellDef i18n>Email</th>
        <td mat-cell *matCellDef="let user">{{ user.email }}</td>
      </ng-container>
      <ng-container matColumnDef="phone">
        <th mat-header-cell mat-sort-header *matHeaderCellDef i18n>Phone</th>
        <td mat-cell *matCellDef="let user">{{ user.phone }}</td>
      </ng-container>
      <ng-container matColumnDef="tools">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let user" class="td-tools">
          <button mat-icon-button (click)="viewDetail(user)">
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
export class AccountsMembersComponent implements AfterViewInit {
  private router = inject(Router);
  private accountsService = inject(AccountsService);
  private notificationService = inject(NotificationService);

  @Input() accountId!: string;

  displayedColumns: string[] = [
    'firstname',
    'lastname',
    'email',
    'phone',
    'tools',
  ];
  list: UserDto[] = [];
  total = 0;

  private filterSubject = new Subject<string>();

  @ViewChild('filter') filter!: ElementRef<HTMLInputElement>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    this.filterSubject.pipe(debounceTime(500)).subscribe((q) => {
      if (q.length > 2 || q.length === 0) {
        this.refreshUsers();
      }
    });
  }

  ngAfterViewInit(): void {
    this.refreshUsers();
  }

  applyFilter() {
    this.filterSubject.next(this.filter.nativeElement.value);
  }

  refreshUsers(): void {
    const request: AccountsMembersListRequest = {
      page: this.paginator.pageIndex,
      per_page: this.paginator.pageSize,
      sort_by: this.sort.active,
      sort_dir: this.sort.direction,
      q: this.filter.nativeElement.value || undefined,
    };

    this.accountsService
      .getAccountMembersList(this.accountId, request)
      .then((res) => {
        this.list = res.list;
        this.total = res.total;
        this.paginator.length = this.total;
      })
      .catch(() => {
        this.notificationService.error($localize`Failed to fetch users`);
      });
  }

  viewDetail(user: UserDto): void {
    this.router.navigate([`/users/detail`, user._id]);
  }
}
