import { DOCUMENT, inject } from '@angular/core';
import { CanActivateFn, RedirectCommand, Router, Routes } from '@angular/router';
import { MessagesPage } from './pages/messages-page/messages-page';
import { MessagesStore } from './stores/messages.store';

const openInbox: CanActivateFn = () => {
  const mobile = inject(DOCUMENT).defaultView?.matchMedia?.('(max-width: 47.9375rem)').matches;
  if (mobile) return true;
  const conversations = inject(MessagesStore).conversations();
  const [latest] = conversations
    .filter((c) => c.id.trim())
    .sort(
      (a, b) =>
        (b.lastActivity ? Date.parse(b.lastActivity.at) : -Infinity) -
        (a.lastActivity ? Date.parse(a.lastActivity.at) : -Infinity),
    );
  if (!latest) return true;
  return new RedirectCommand(inject(Router).createUrlTree(['/mensajes', latest.id]), {
    replaceUrl: true,
  });
};
export const messagesRoutes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [openInbox],
    component: MessagesPage,
    title: 'Mensajes | Axteri Marketplace',
  },
  { path: ':conversationId', component: MessagesPage, title: 'Mensajes | Axteri Marketplace' },
];
