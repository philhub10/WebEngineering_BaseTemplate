import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SearchForm } from './search-form/search-form';

@Component({
  selector: 'app-site-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SearchForm],
  templateUrl: './site-nav.html',
})
export class SiteNav {}
