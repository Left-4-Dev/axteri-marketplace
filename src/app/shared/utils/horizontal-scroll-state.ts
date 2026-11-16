import { afterRenderEffect, signal } from '@angular/core';

/** Local DOM state for finite horizontal lists; call in an Angular injection context. */
export function horizontalScrollState(
  getViewport: () => HTMLElement | undefined,
  content: () => unknown,
) {
  const canScrollPrev = signal(false);
  const canScrollNext = signal(false);
  const update = () => {
    const viewport = getViewport();
    const end = viewport ? Math.max(0, viewport.scrollWidth - viewport.clientWidth) : 0;
    const left = viewport ? Math.max(0, Math.min(end, viewport.scrollLeft)) : 0;
    // One CSS pixel tolerates fractional layout and scroll rounding at either boundary.
    canScrollPrev.set(end > 1 && left > 1);
    canScrollNext.set(end > 1 && left < end - 1);
  };

  afterRenderEffect((onCleanup) => {
    content();
    const viewport = getViewport();
    update();
    if (!viewport) return;

    const resize = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update);
    const observeContent = (reset = false) => {
      if (reset) resize?.disconnect();
      resize?.observe(viewport);
      // A list may keep its own width while its items extend beyond it.
      for (const child of viewport.children) {
        resize?.observe(child);
        for (const item of child.children) resize?.observe(item);
      }
    };
    observeContent();
    const mutations = new MutationObserver(() => {
      observeContent(true);
      update();
    });
    mutations.observe(viewport, { childList: true, subtree: true, characterData: true });
    viewport.addEventListener('scroll', update, { passive: true });
    viewport.addEventListener('load', update, true);
    viewport.addEventListener('error', update, true);
    onCleanup(() => {
      resize?.disconnect();
      mutations.disconnect();
      viewport.removeEventListener('scroll', update);
      viewport.removeEventListener('load', update, true);
      viewport.removeEventListener('error', update, true);
    });
  });

  return {
    canScrollPrev: canScrollPrev.asReadonly(),
    canScrollNext: canScrollNext.asReadonly(),
    update,
  };
}
