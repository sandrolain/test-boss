import { Component, Input } from '@angular/core';
import { TestresultDto } from '../../../services/testresults/testresults.model';

@Component({
  selector: 'app-testresults-pass',
  standalone: true,
  imports: [],
  template: `
    @if (!value.updated) {
    <span class="pending" i18n>PENDING</span>
    } @else if (value.pass) { @if (value.flacky) {
    <span class="pass flaky">PASS / FLAKY</span>
    } @else {
    <span class="pass">PASS</span>
    } } @else if (value.flacky) {
    <span class="fail flaky">FAIL / FLAKY</span>
    } @else {
    <span class="fail">FAIL</span>
    }
  `,
  styles: `
    span {
      display: inline-block;
      padding: 4px;
      line-height: 1em;
      border-radius: 4px;
    }

    .pending {
      background-color: #EEEEEE;
      color: #000000;
    }
    .fail {
      background-color: #FF0000;
      color: #FFFFFF;
    }
    .pass {
      background-color: #009900;
      color: #FFFFFF;
      font-weight: bold;

      &.flaky {
        background-color: #999900;
      }
    }
  `,
})
export class TestresultsPassComponent {
  @Input() value!: TestresultDto;
}
