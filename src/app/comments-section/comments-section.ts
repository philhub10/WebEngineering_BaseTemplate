import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommentToggle } from './comment-toggle/comment-toggle';
import { CommentForm } from './comment-form/comment-form';
import { CommentList } from './comment-list/comment-list';

@Component({
  selector: 'app-comments-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommentToggle, CommentForm, CommentList],
  templateUrl: './comments-section.html',
})
export class CommentsSection {}
