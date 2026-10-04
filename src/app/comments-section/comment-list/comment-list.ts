import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-comment-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './comment-list.html',
})
export class CommentList {}
