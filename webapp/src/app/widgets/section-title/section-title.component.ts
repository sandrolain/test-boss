import { Component } from '@angular/core';

@Component({
  selector: 'app-section-title',
  standalone: true,
  imports: [],
  template: ` <h2><ng-content></ng-content></h2> `,
  styles: `
    h2 {
      font-size: 1.5rem;
      font-weight: 500;
      margin: 0;
      padding: 0 16px;
      margin-bottom: 1rem;
      color: var(--app-title-color);
    }
  `,
})
export class SectionTitleComponent {}
