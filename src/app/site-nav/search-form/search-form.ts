import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-search-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-form.html',
})
export class SearchForm {}
