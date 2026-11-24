import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import type { User } from '../../auth';
import type { Comment } from '../../comments';

@Component({
  selector: 'app-comment-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './comment-list.html',
})
export class CommentList {
  readonly comments = input.required<Comment[]>();
  // null when nobody is logged in.
  readonly user = input<User | null>(null);
  // Emits the id of the comment whose delete button was clicked.
  readonly deleted = output<string>();
  // Emits the id of the comment whose report button was clicked.
  readonly reported = output<string>();

  // Mirrors the server's policy only to hide buttons that would fail;
  // the API decides (401/403) whatever the UI shows.
  protected canDelete(comment: Comment): boolean {
    const user = this.user();
    return (
      user !== null &&
      (user.role === 'moderator' || comment.authorId === user.id)
    );
  }
}
