import type { OnDestroy, OnInit } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { CommentToggle } from './comment-toggle/comment-toggle';
import { CommentForm } from './comment-form/comment-form';
import { CommentList } from './comment-list/comment-list';
import type { Comment, NewComment } from '../comments';
import { createComment, deleteComment, loadComments } from '../comments';

@Component({
  selector: 'app-comments-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommentToggle, CommentForm, CommentList],
  templateUrl: './comments-section.html',
})
export class CommentsSection implements OnInit, OnDestroy {
  // The bear these comments belong to, e.g. "ursus-arctos".
  readonly bearId = input.required<string>();

  protected readonly commentsExpanded = signal(false);
  protected readonly comments = signal<Comment[]>([]);
  protected readonly errorMessage = signal<string | null>(null);

  // Cancels the loading request if this component is destroyed first.
  private readonly abortController = new AbortController();

  ngOnInit(): void {
    loadComments(this.bearId(), this.abortController.signal)
      .then((comments) => {
        this.comments.set(comments);
      })
      .catch((error: unknown) => {
        if (this.abortController.signal.aborted) return;
        this.showError('The comments could not be loaded.', error);
      });
  }

  ngOnDestroy(): void {
    this.abortController.abort();
  }

  protected onToggleComments(): void {
    this.commentsExpanded.update((expanded) => !expanded);
  }

  protected onAddComment(newComment: NewComment): void {
    createComment(this.bearId(), newComment)
      .then((comment) => {
        this.errorMessage.set(null);
        this.comments.update((comments) => [...comments, comment]);
      })
      .catch((error: unknown) => {
        this.showError('Your comment could not be saved.', error);
      });
  }

  protected onDeleteComment(id: string): void {
    deleteComment(id)
      .then(() => {
        this.errorMessage.set(null);
        this.comments.update((comments) =>
          comments.filter((comment) => comment.id !== id)
        );
      })
      .catch((error: unknown) => {
        this.showError('The comment could not be deleted.', error);
      });
  }

  private showError(message: string, error: unknown): void {
    // The user only sees a generic error message, so log the real cause
    // here for debugging.
    // eslint-disable-next-line no-console -- see comment above
    console.error(message, error);
    this.errorMessage.set(`${message} Please try again later.`);
  }
}
