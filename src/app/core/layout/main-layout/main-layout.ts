import { Component, DOCUMENT, inject, viewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from '../footer/footer';
import { FloatingActions } from '../floating-actions/floating-actions';
import { Header } from '../header/header';

@Component({
  selector: 'app-main-layout',
  imports: [Header, RouterOutlet, Footer, FloatingActions],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  private readonly document = inject(DOCUMENT);
  private readonly header = viewChild.required(Header);

  protected focusPrimarySearch(): void {
    const target = this.document.querySelector<HTMLElement>('[data-primary-search]');
    if (!target) {
      this.header().openSearch();
      return;
    }

    const reducedMotion = this.document.defaultView?.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'nearest', behavior: reducedMotion ? 'instant' : 'smooth' });
  }
}
