import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { initSearchHighlighter } from './search';
import { initCommentToggle, initCommentForm } from './comment';
import { loadBears } from './bears';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app.html',
})
export class App implements OnInit {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this -- Angular lifecycle hook
  ngOnInit(): void {
    initSearchHighlighter();
    initCommentToggle();
    initCommentForm();
    void loadBears();
  }
}
