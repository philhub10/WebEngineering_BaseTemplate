import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import type { Bear } from './bears';
import { loadBears } from './bears';
import { SiteHeader } from './site-header/site-header';
import { SiteNav } from './site-nav/site-nav';
import { BearArticle } from './bear-article/bear-article';
import { CommentsSection } from './comments-section/comments-section';
import { BearList } from './bear-list/bear-list';
import { RelatedLinks } from './related-links/related-links';
import { SiteFooter } from './site-footer/site-footer';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SiteHeader,
    SiteNav,
    BearArticle,
    CommentsSection,
    BearList,
    RelatedLinks,
    SiteFooter,
  ],
  templateUrl: './app.html',
})
export class App implements OnInit {
  // Task 4 turns this into a proper loading/success/empty/error state; for
  // now it only has to hold the data so `BearList` can render it with keys.
  protected readonly bears = signal<Bear[]>([]);

  ngOnInit(): void {
    loadBears()
      .then((bears) => {
        this.bears.set(bears);
      })
      .catch((error: unknown) => {
        // The user only sees a generic error message, so log the real cause
        // here for debugging. Task 4 adds a user-facing error state.
        // eslint-disable-next-line no-console -- see comment above
        console.error('Failed to load bear data:', error);
      });
  }
}
