import {
  ChangeDetectionStrategy,
  Component,
  output,
  signal,
} from '@angular/core';
import type { NewComment } from '../../comments';

@Component({
  selector: 'app-comment-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './comment-form.html',
})
export class CommentForm {
  readonly submitted = output<NewComment>();

  protected readonly name = signal('');
  protected readonly text = signal('');

  protected onNameInput(event: Event): void {
    const { target } = event;
    if (!(target instanceof HTMLInputElement)) return;
    this.name.set(target.value);
  }

  protected onTextInput(event: Event): void {
    const { target } = event;
    if (!(target instanceof HTMLInputElement)) return;
    this.text.set(target.value);
  }

  protected onSubmit(event: SubmitEvent): void {
    event.preventDefault();
    this.submitted.emit({ author: this.name(), text: this.text() });
    this.name.set('');
    this.text.set('');
  }
}
