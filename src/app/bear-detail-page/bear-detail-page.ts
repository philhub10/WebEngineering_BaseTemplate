import type { OnDestroy, OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Bear } from '../bears';
import { loadBears } from '../bears';

type DetailState =
  | { status: 'loading' }
  | { status: 'found'; bear: Bear }
  | { status: 'not-found' }
  | { status: 'error'; message: string };

@Component({
  selector: 'app-bear-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './bear-detail-page.html',
})
export class BearDetailPage implements OnInit, OnDestroy {
  // Bound automatically from the `:name` route parameter by the router
  // (see `withComponentInputBinding()` in app.config.ts).
  readonly name = input.required<string>();

  private readonly state = signal<DetailState>({ status: 'loading' });

  protected readonly isLoading = computed(
    () => this.state().status === 'loading'
  );
  protected readonly isNotFound = computed(
    () => this.state().status === 'not-found'
  );
  protected readonly errorMessage = computed(() => {
    const current = this.state();
    return current.status === 'error' ? current.message : null;
  });
  protected readonly bear = computed(() => {
    const current = this.state();
    return current.status === 'found' ? current.bear : null;
  });

  private abortController: AbortController | null = null;

  ngOnInit(): void {
    this.fetchBear();
  }

  ngOnDestroy(): void {
    this.abortController?.abort();
  }

  private fetchBear(): void {
    this.abortController?.abort();
    const controller = new AbortController();
    this.abortController = controller;

    this.state.set({ status: 'loading' });

    loadBears(controller.signal)
      .then((bears) => {
        if (controller.signal.aborted) return;
        const bear = bears.find((candidate) => candidate.name === this.name());
        this.state.set(
          bear === undefined
            ? { status: 'not-found' }
            : { status: 'found', bear }
        );
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        // The user only sees a generic error message, so log the real cause
        // here for debugging.
        // eslint-disable-next-line no-console -- see comment above
        console.error('Failed to load bear data:', error);
        this.state.set({
          status: 'error',
          message:
            'Sorry, the bear data could not be loaded right now. Please try again later.',
        });
      });
  }
}
