import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Bear } from '../bears';
import { BearCard } from './bear-card/bear-card';

@Component({
  selector: 'app-bear-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BearCard],
  templateUrl: './bear-list.html',
})
export class BearList {
  readonly bears = input.required<Bear[]>();
}
