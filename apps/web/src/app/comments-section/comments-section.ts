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
import { errorMessage } from '../problem';

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
  // Where the next page starts; null when all comments are loaded.
  protected readonly nextCursor = signal<string | null>(null);
  protected readonly loadingMore = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Cancels the loading request if this component is destroyed first.
  private readonly abortController = new AbortController();

  ngOnInit(): void {
    loadComments(this.bearId(), null, this.abortController.signal)
      .then((page) => {
        this.comments.set(page.items);
        this.nextCursor.set(page.nextCursor);
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

  protected onLoadMore(): void {
    const cursor = this.nextCursor();
    if (cursor === null) return;
    this.loadingMore.set(true);
    loadComments(this.bearId(), cursor, this.abortController.signal)
      .then((page) => {
        this.errorMessage.set(null);
        this.comments.update((comments) => [...comments, ...page.items]);
        this.nextCursor.set(page.nextCursor);
      })
      .catch((error: unknown) => {
        if (this.abortController.signal.aborted) return;
        this.showError('More comments could not be loaded.', error);
      })
      .finally(() => {
        this.loadingMore.set(false);
      });
  }

  protected onAddComment(newComment: NewComment): void {
    createComment(this.bearId(), newComment)
      .then((comment) => {
        this.errorMessage.set(null);
        // Newest first, like the API.
        this.comments.update((comments) => [comment, ...comments]);
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

  // Shows the problem's detail, e.g. "Your comment could not be saved:
  // text must not be empty". `message` says which action failed.
  private showError(message: string, error: unknown): void {
    // eslint-disable-next-line no-console -- the full error helps debugging
    console.error(message, error);
    this.errorMessage.set(
      `${message} ${errorMessage(error, 'Please try again later.')}`
    );
  }
}
