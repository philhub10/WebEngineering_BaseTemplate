import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface Comment {
  id: string;
  name: string;
  text: string;
}

@Component({
  selector: 'app-comment-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './comment-list.html',
})
export class CommentList {
  readonly comments = input.required<Comment[]>();
}
