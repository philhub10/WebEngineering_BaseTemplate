import type { OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { highlightArticleMatches } from '../../search';

@Component({
  selector: 'app-search-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-form.html',
})
export class SearchForm implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly query = signal('');

  ngOnInit(): void {
    this.query.set(this.route.snapshot.queryParamMap.get('q') ?? '');
  }

  protected onQueryInput(event: Event): void {
    const { target } = event;
    if (!(target instanceof HTMLInputElement)) return;
    this.query.set(target.value);
  }

  protected onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const query = this.query();
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: query === '' ? null : query },
      queryParamsHandling: 'merge',
    });
    highlightArticleMatches(query);
  }
}
