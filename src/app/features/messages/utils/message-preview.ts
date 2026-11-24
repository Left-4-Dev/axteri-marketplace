import { Message } from '../models/messages.model';

export function getMessagePreview(message: Message): string {
  switch (message.kind) {
    case 'text':
      return message.body.replace(/\s+/g, ' ').trim();
    case 'product-request':
      return 'Solicitud de productos';
    case 'system':
      return message.event.label.replace(/\s+/g, ' ').trim();
  }
}

export function getSellerInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}
