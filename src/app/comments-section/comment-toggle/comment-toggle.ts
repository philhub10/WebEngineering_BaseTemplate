import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-comment-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './comment-toggle.html',
})
export class CommentToggle {
  readonly expanded = input.required<boolean>();
  readonly toggled = output();
}
