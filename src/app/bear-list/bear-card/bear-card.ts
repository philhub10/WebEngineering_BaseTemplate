import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Bear } from '../../bears';

@Component({
  selector: 'app-bear-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bear-card.html',
})
export class BearCard {
  readonly bear = input.required<Bear>();
}
