import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-bear-article',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './bear-article.html',
})
export class BearArticle {}
