import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../../../app.routes';

describe('MessagesPage', () => {
  let harness: RouterTestingHarness;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter(routes)],
    }).compileComponents();
    harness = await RouterTestingHarness.create('/mensajes/ldf-projects');
    element = harness.routeNativeElement!;
  });

  it('loads inside MainLayout and renders the selected conversation, message timeline, and permanent context tabs', () => {
    expect(element.querySelectorAll('app-header')).toHaveLength(1);
    expect(element.querySelectorAll('app-footer')).toHaveLength(1);
    expect(element.querySelector('main app-messages-page')).not.toBeNull();

    const breadcrumb = element.querySelector('nav[aria-label="Breadcrumb"]');
    expect(breadcrumb?.textContent).toContain('Inicio');
    expect(breadcrumb?.textContent).toContain('Mensajes');

    expect(element.querySelector('.conversation-header__name')?.textContent?.trim()).toBe(
      'LDF Projects',
    );
    expect(element.querySelectorAll('.message-list__message').length).toBe(4);

    const tabs = Array.from(
      element.querySelectorAll('app-conversation-context [role="tab"]'),
      (tab) => tab.textContent?.trim(),
    );
    expect(tabs).toEqual(['Productos', 'Archivos', 'Órdenes']);

    const attachmentBtn = element.querySelector<HTMLButtonElement>('.message-composer__attachment');
    expect(attachmentBtn?.disabled).toBe(true);

    const textarea = element.querySelector<HTMLTextAreaElement>('.message-composer__textarea');
    expect(textarea?.placeholder).toBe('Escribe un mensaje...');
  });

  it('filters conversations in the left panel and sends a local text message on Enter', () => {
    const searchInput = element.querySelector<HTMLInputElement>(
      '.conversation-list__search-input',
    )!;
    searchInput.value = 'Electro Sur';
    searchInput.dispatchEvent(new Event('input'));
    harness.detectChanges();

    const renderedItems = element.querySelectorAll('.conversation-list__item');
    expect(renderedItems.length).toBe(1);
    expect(renderedItems[0].textContent).toContain('Electro Sur Industrial');

    const textarea = element.querySelector<HTMLTextAreaElement>('.message-composer__textarea')!;
    textarea.value = 'Consulta urgente de interruptores';
    textarea.dispatchEvent(new Event('input'));
    harness.detectChanges();

    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false, cancelable: true }),
    );
    harness.detectChanges();

    expect(textarea.value).toBe('');
    const bubbles = Array.from(element.querySelectorAll('.message-list__body'), (node) =>
      node.textContent?.trim(),
    );
    expect(bubbles).toContain('Consulta urgente de interruptores');
  });

  it('auto-scrolls the message list to the latest message on load, conversation change, and message send', async () => {
    const messageList = element.querySelector<HTMLElement>('.message-list')!;
    Object.defineProperty(messageList, 'scrollHeight', { configurable: true, value: 640 });
    messageList.scrollTop = 0;

    await harness.navigateByUrl('/mensajes/electro-sur-industrial');
    harness.detectChanges();
    expect(messageList.scrollTop).toBe(640);

    Object.defineProperty(messageList, 'scrollHeight', { configurable: true, value: 780 });
    const textarea = element.querySelector<HTMLTextAreaElement>('.message-composer__textarea')!;
    textarea.value = 'Nuevo mensaje para probar auto-scroll';
    textarea.dispatchEvent(new Event('input'));
    harness.detectChanges();

    textarea.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', shiftKey: false, cancelable: true }),
    );
    harness.detectChanges();

    expect(messageList.scrollTop).toBe(780);
  });

  it('toggles between context tabs and seller information view', () => {
    const ordersTab = element.querySelector<HTMLButtonElement>('#context-tab-orders')!;
    ordersTab.click();
    harness.detectChanges();

    expect(ordersTab.getAttribute('aria-selected')).toBe('true');
    expect(
      element.querySelector('app-conversation-context [role="tabpanel"]')?.textContent,
    ).toContain('Órdenes de compra');

    const infoButton = element.querySelector<HTMLButtonElement>(
      'button[aria-label="Información del proveedor"]',
    )!;
    infoButton.click();
    harness.detectChanges();

    expect(element.querySelector('#context-seller-name')?.textContent?.trim()).toBe('LDF Projects');
    expect(element.querySelector('.conversation-context__details')?.textContent).toContain(
      'Importador',
    );

    const backButton = element.querySelector<HTMLButtonElement>('.conversation-context__back')!;
    backButton.click();
    harness.detectChanges();

    expect(element.querySelector('#context-tab-orders')?.getAttribute('aria-selected')).toBe(
      'true',
    );
  });

  it('shows the not-found state when navigating to an unknown conversationId', async () => {
    await harness.navigateByUrl('/mensajes/id-inexistente');
    harness.detectChanges();

    expect(element.querySelector('.messages-page__not-found-title')?.textContent?.trim()).toBe(
      'Conversación no encontrada',
    );
    expect(element.querySelector('.messages-page__not-found-copy')?.textContent).toContain(
      'id-inexistente',
    );
  });
});
