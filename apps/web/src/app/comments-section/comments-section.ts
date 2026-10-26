import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommentToggle } from './comment-toggle/comment-toggle';
import { CommentForm } from './comment-form/comment-form';
import type { NewComment } from './comment-form/comment-form';
import { CommentList } from './comment-list/comment-list';
import type { Comment } from './comment-list/comment-list';

@Component({
  selector: 'app-comments-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommentToggle, CommentForm, CommentList],
  templateUrl: './comments-section.html',
})
export class CommentsSection {
  protected readonly commentsExpanded = signal(false);
  protected readonly comments = signal<Comment[]>([
    {
      id: crypto.randomUUID(),
      name: 'Bob Fossil',
      text: 'Oh I am so glad you taught me all about the big brown angry guys...',
    },
  ]);

  protected onToggleComments(): void {
    this.commentsExpanded.update((expanded) => !expanded);
  }

  protected onAddComment(newComment: NewComment): void {
    const comment: Comment = { id: crypto.randomUUID(), ...newComment };
    this.comments.update((comments) => [...comments, comment]);
  }
}
