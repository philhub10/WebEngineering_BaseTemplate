import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BearArticle } from '../bear-article/bear-article';
import { BearList } from '../bear-list/bear-list';
import { RelatedLinks } from '../related-links/related-links';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BearArticle, BearList, RelatedLinks],
  templateUrl: './home-page.html',
})
export class HomePage {}
