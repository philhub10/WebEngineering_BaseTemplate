import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { highlightArticleMatches } from '../../search';

@Component({
  selector: 'app-search-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-form.html',
})
export class SearchForm {
  protected readonly query = signal('');

  protected onQueryInput(event: Event): void {
    const { target } = event;
    if (!(target instanceof HTMLInputElement)) return;
    this.query.set(target.value);
  }

  protected onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    highlightArticleMatches(this.query());
  }
}
