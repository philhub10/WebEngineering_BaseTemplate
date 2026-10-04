import { ChangeDetectionStrategy, Component } from '@angular/core';
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
export class App {}
