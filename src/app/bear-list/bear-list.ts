import type { OnDestroy, OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import type { Bear } from '../bears';
import { loadBears } from '../bears';
import { BearCard } from './bear-card/bear-card';

type BearsState =
  | { status: 'loading' }
  | { status: 'success'; bears: Bear[] }
  | { status: 'empty' }
  | { status: 'error'; message: string };

@Component({
  selector: 'app-bear-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BearCard],
  templateUrl: './bear-list.html',
})
export class BearList implements OnInit, OnDestroy {
  private readonly state = signal<BearsState>({ status: 'loading' });

  protected readonly isLoading = computed(
    () => this.state().status === 'loading'
  );
  protected readonly isEmpty = computed(() => this.state().status === 'empty');
  protected readonly errorMessage = computed(() => {
    const current = this.state();
    return current.status === 'error' ? current.message : null;
  });
  protected readonly bears = computed(() => {
    const current = this.state();
    return current.status === 'success' ? current.bears : [];
  });

  // Aborts the in-flight request for a load that is no longer the most
  // recent one (superseded, or this component was destroyed) so a slow
  // response can never overwrite a newer result.
  private abortController: AbortController | null = null;

  ngOnInit(): void {
    this.fetchBears();
  }

  ngOnDestroy(): void {
    this.abortController?.abort();
  }

  private fetchBears(): void {
    this.abortController?.abort();
    const controller = new AbortController();
    this.abortController = controller;

    this.state.set({ status: 'loading' });

    loadBears(controller.signal)
      .then((bears) => {
        if (controller.signal.aborted) return;
        const [firstBear] = bears;
        this.state.set(
          firstBear === undefined
            ? { status: 'empty' }
            : { status: 'success', bears }
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
