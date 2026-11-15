import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import type { Comment } from '../../comments';

@Component({
  selector: 'app-comment-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './comment-list.html',
})
export class CommentList {
  readonly comments = input.required<Comment[]>();
  // Emits the id of the comment whose delete button was clicked.
  readonly deleted = output<string>();
  // Emits the id of the comment whose report button was clicked.
  readonly reported = output<string>();
}
