import { Component } from '@angular/core';

@Component({
  selector: 'app-section-title',
  standalone: true,
  imports: [],
  template: `<div class="bar">
    <div class="left">
      <h2><ng-content></ng-content></h2>
    </div>
    <div class="tools">
      <ng-content select="[tool]"></ng-content>
    </div>
  </div>`,
  styles: `
    :host {
      position: relative;
    }

    .bar {
      height: 48px;
      position: sticky;
      top: 0;
      z-index: 1;
      display: flex;
      justify-content: space-between;
      background-color: var(--mat-sidenav-content-background-color);
      border-top: 1px solid var(--mat-divider-color);
      border-top-right-radius: var(--mat-sidenav-container-shape);
      border-top-left-radius: var(--mat-sidenav-container-shape);
      padding: 10px 0;
    }
    .left {
      display: flex;
      align-items: center;
    }
    h2 {
      font-size: 1.5rem;
      font-weight: 500;
      margin: 0;
      padding: 0 16px;
      color: var(--app-title-color);
    }
    .tools {
      display: flex;
      gap: 16px;
      align-items: center;
      padding: 0 16px;
    }



  `,
})
export class SectionTitleComponent {}
