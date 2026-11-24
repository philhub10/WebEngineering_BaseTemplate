import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthState } from '../auth-state';
import { SearchForm } from './search-form/search-form';

@Component({
  selector: 'app-site-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SearchForm],
  templateUrl: './site-nav.html',
})
export class SiteNav implements OnInit {
  protected readonly auth = inject(AuthState);

  ngOnInit(): void {
    // Restores the login after a reload: the cookie is still there.
    this.auth.refresh().catch((error: unknown) => {
      // eslint-disable-next-line no-console -- not fatal, the user can log in
      console.error('Could not load the current user:', error);
    });
  }

  protected onLogout(): void {
    this.auth.logout().catch((error: unknown) => {
      // eslint-disable-next-line no-console -- see above
      console.error('Logout failed:', error);
    });
  }
}
