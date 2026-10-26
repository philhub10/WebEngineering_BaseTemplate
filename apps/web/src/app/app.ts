import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeader } from './site-header/site-header';
import { SiteNav } from './site-nav/site-nav';
import { SiteFooter } from './site-footer/site-footer';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SiteHeader, SiteNav, SiteFooter],
  templateUrl: './app.html',
})
export class App {}
