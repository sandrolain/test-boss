import { Component, Input, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-title',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  styles: `
    :host {
      position: relative;
    }

    .bar {
      position: sticky;
      top: 0;
      z-index: 1;
      display: flex;
      justify-content: space-between;
      background-color: var(--mat-sidenav-content-background-color);
      border-bottom: 1px solid var(--mat-divider-color);
      border-bottom-right-radius: var(--mat-sidenav-container-shape);
      border-bottom-left-radius: var(--mat-sidenav-container-shape);
    }
    .left {
      display: flex;
      align-items: center;
    }
    .back {
      margin: 0 16px;
    }
    h1 {
      color: var(--app-title-color);
      margin: 0;
      line-height: 1em;
      font-size: 32px;
      padding: 16px;
      display: flex;
      align-items: center;

      .back + & {
        border-left: 1px solid var(--mat-divider-color);
      }
    }
    mat-icon {
      margin-right: 16px;
      font-size: inherit;
      width: 1em;
      height: 1em;
    }
    .tools {
      display: flex;
      gap: 16px;
      align-items: center;
      padding: 0 16px;
    }
  `,
  template: `
    <div class="bar">
      <div class="left">
        @if(back.length > 0) {
        <button mat-icon-button (click)="goBack()" tool class="back">
          <mat-icon>arrow_back</mat-icon>
        </button>
        }
        <h1>
          @if(icon != '') {<mat-icon>{{ icon }}</mat-icon
          >} <ng-content></ng-content>
        </h1>
      </div>
      <div class="tools">
        <ng-content select="[tool]"></ng-content>
      </div>
    </div>
  `,
})
export class PageTitleComponent {
  @Input() icon = '';
  @Input() back: any[] = [];

  private router = inject(Router);

  goBack() {
    this.router.navigate(this.back);
  }
}
