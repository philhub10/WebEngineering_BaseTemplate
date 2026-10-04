import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Bear } from '../../bears';

@Component({
  selector: 'app-bear-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './bear-card.html',
})
export class BearCard {
  readonly bear = input.required<Bear>();
}
