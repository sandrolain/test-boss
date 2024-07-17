import { Component, Input } from '@angular/core';
import { TestresultDto } from '../../../services/testresults/testresults.model';

@Component({
  selector: 'app-testresults-desc',
  standalone: true,
  imports: [],
  template: `
    <div class="name">{{ value.name }}</div>
    <div class="desc" [innerHTML]="value.description"></div>
  `,
  styles: `
    .name {
      font-weight: bold;
    }
    .desc {
      margin-top: 2px;
    }
  `,
})
export class TestresultsDescComponent {
  @Input() value!: TestresultDto;
}
