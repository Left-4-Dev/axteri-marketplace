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
    expect(element.querySelectorAll('.message-list__message').length).toBe(5);

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

  it('opens Products, filters the catalog and sends the tray as a request with auto-scroll', () => {
    const click = (selector: string) => {
      element.querySelector<HTMLButtonElement>(selector)!.click();
      harness.detectChanges();
    };
    click('#context-tab-files');
    click('.messages-page__quick button');
    expect(element.querySelector('#context-tab-products')?.getAttribute('aria-selected')).toBe(
      'true',
    );
    const search = element.querySelector<HTMLInputElement>('app-message-product-catalog input')!;
    search.value = 'w22';
    search.dispatchEvent(new Event('input'));
    harness.detectChanges();
    expect(element.querySelectorAll('app-message-product-catalog li')).toHaveLength(1);
    click('app-message-product-catalog .add');
    click('app-product-selection-tray button[aria-label^="Aumentar"]');
    click('app-message-product-catalog button[aria-label^="Disminuir"]');
    expect(
      element
        .querySelector('app-product-selection-tray app-message-product-quantity span')
        ?.textContent?.trim(),
    ).toBe('1');
    click('app-product-selection-tray .remove');
    expect(element.querySelector('app-product-selection-tray')).toBeNull();
    click('app-message-product-catalog .add');
    click('app-message-product-catalog button[aria-label^="Aumentar"]');
    const log = element.querySelector<HTMLElement>('.message-list')!;
    Object.defineProperty(log, 'scrollHeight', { configurable: true, value: 960 });
    click('.message-composer__submit');
    expect(log.scrollTop).toBe(960);
    expect(element.querySelector('app-product-selection-tray')).toBeNull();
    expect(log.querySelector('.message-list__request-title')?.textContent).toContain(
      'Solicitud de productos',
    );
    const line = log.querySelector('.message-list__products li')!;
    expect(line.textContent).toContain('W22');
    expect(line.textContent).toContain('Cantidad: 2');
    expect(line.textContent).toContain('345');
    expect(line.querySelector('img')).not.toBeNull();
  });

  it('sends the composer draft as a note in one product request on Enter', () => {
    element.querySelector<HTMLButtonElement>('app-message-product-catalog .add')!.click();
    harness.detectChanges();
    const textarea = element.querySelector<HTMLTextAreaElement>('.message-composer__textarea')!;
    const count = element.querySelectorAll('.message-list__message').length;
    textarea.value = '  Entrega\nen Lima  ';
    textarea.dispatchEvent(new Event('input'));
    harness.detectChanges();
    textarea.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
    harness.detectChanges();
    const messages = element.querySelectorAll('.message-list__message');
    expect(messages.length).toBe(count + 1);
    const last = messages[messages.length - 1];
    expect(last.querySelector('.message-list__products')).not.toBeNull();
    expect(last.querySelector('.message-list__body')?.textContent).toBe('Entrega\nen Lima');
    expect(textarea.value).toBe('');
  });

  it('shares the active seller contact and scrolls to it', async () => {
    const log = element.querySelector<HTMLElement>('.message-list')!;
    Object.defineProperty(log, 'scrollHeight', { configurable: true, value: 880 });
    element.querySelector<HTMLButtonElement>('.messages-page__quick button:last-child')!.click();
    harness.detectChanges();
    const card = Array.from(log.querySelectorAll('.message-list__detail')).at(-1);
    expect(card?.textContent).toContain('Lucía Ramos');
    expect(card?.textContent).toContain('ldf-projects@example.com');
    expect(card?.textContent).toContain('+51');
    expect(log.scrollTop).toBe(880);
    await harness.navigateByUrl('/mensajes/automatizacion-andina');
    expect(log.textContent).toContain('Ana Vega');
    expect(log.textContent).not.toContain('Lucía Ramos');
  });

  it.each([
    ['first-child', 'Cotización aceptada'],
    ['last-child', 'Cambios solicitados'],
  ])('applies the quotation decision %s only to this conversation', async (selector, status) => {
    expect(element.querySelector('.message-list__document')?.textContent).toContain(
      'Cotización LDF-024.pdf',
    );
    element
      .querySelector<HTMLButtonElement>('.message-list__decisions button:' + selector)!
      .click();
    harness.detectChanges();
    expect(element.querySelector('.message-list__detail [role=status]')?.textContent).toBe(status);
    expect(element.querySelector('.message-list__decisions')).toBeNull();
    await harness.navigateByUrl('/mensajes/electro-sur-industrial');
    expect(element.querySelector('.message-list__document')).toBeNull();
    await harness.navigateByUrl('/mensajes/ldf-projects');
    expect(element.querySelector('.message-list__detail [role=status]')?.textContent).toBe(status);
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
