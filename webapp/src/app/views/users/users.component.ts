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
import { UserDto, UsersListRequest } from '../../services/users/users.model';
import { UsersService } from '../../services/users/users.service';
import { AlertMessageComponent } from '../../widgets/alert-message/alert-message.component';
import { LoaderOverlayComponent } from '../../widgets/loader-overlay/loader-overlay.component';
import { PageTitleComponent } from '../../widgets/page-title/page-title.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    PageTitleComponent,
    LoaderOverlayComponent,
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
    <app-page-title icon="people"
      ><span i18n>Users</span>
      <button mat-icon-button routerLink="/users/create" tool>
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
        (page)="refreshUsers()"
      ></mat-paginator>
    </div>
    <table
      mat-table
      class="mat-elevation-z2"
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
        <td class="mat-cell" colspan="7">
          <app-alert-message>No data matching the filter</app-alert-message>
        </td>
      </tr>
    </table>
    @if(loading) {
    <app-loader-overlay></app-loader-overlay>
    }
  `,
})
export class UsersComponent implements AfterViewInit {
  private router = inject(Router);
  private usersService = inject(UsersService);
  private notificationService = inject(NotificationService);

  loading: boolean = false;

  displayedColumns: string[] = [
    'firstname',
    'lastname',
    'email',
    'created_at',
    'updated_at',
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
    const request: UsersListRequest = {
      page: this.paginator.pageIndex,
      per_page: this.paginator.pageSize,
      sort_by: this.sort.active,
      sort_dir: this.sort.direction,
      q: this.filter.nativeElement.value || undefined,
    };

    this.loading = true;
    this.usersService
      .getUsersList(request)
      .then((res) => {
        this.list = res.list;
        this.total = res.total;
        this.paginator.length = this.total;
      })
      .catch(() => {
        this.notificationService.error($localize`Failed to fetch users`);
      })
      .finally(() => {
        this.loading = false;
      });
  }

  viewDetail(user: UserDto): void {
    this.router.navigate([`/users/detail`, user._id]);
  }
}
