import { Component } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loader-overlay',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="wrapper">
      <div class="background"></div>
      <div class="loader">
        <mat-progress-spinner
          color="primary"
          mode="indeterminate"
        ></mat-progress-spinner>
      </div>
    </div>
  `,
  styles: `
    .wrapper {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1000;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
    }
    .background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--mat-app-background-color);
      opacity: 0.5;
    }
    .loader {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  `,
})
export class LoaderOverlayComponent {}
