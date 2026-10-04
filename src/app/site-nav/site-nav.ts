import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SearchForm } from './search-form/search-form';

@Component({
  selector: 'app-site-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchForm],
  templateUrl: './site-nav.html',
})
export class SiteNav {}
