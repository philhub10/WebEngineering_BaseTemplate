import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-comment-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './comment-toggle.html',
})
export class CommentToggle {}
