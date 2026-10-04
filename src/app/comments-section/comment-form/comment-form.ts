import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-comment-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './comment-form.html',
})
export class CommentForm {}
