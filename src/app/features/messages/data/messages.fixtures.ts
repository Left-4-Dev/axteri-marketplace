import { catalog, sellerLocation } from '../../../core/catalog/catalog.repository';
import { ConversationSeller } from '../models/messages.model';
import { ContactDetails, Conversation, Message } from '../models/messages.model';

export const SELLER_CONTACTS: Readonly<Record<string, ContactDetails>> = {
  'ldf-projects': {
    name: 'Lucía Ramos',
    phone: '+51 1 000 0001',
    email: 'ldf-projects@example.com',
  },
  'electro-sur-industrial': {
    name: 'Diego Medina',
    phone: '+51 1 000 0002',
    email: 'electro-sur-industrial@example.com',
  },
  'automatizacion-andina': {
    name: 'Ana Vega',
    phone: '+51 1 000 0003',
    email: 'automatizacion-andina@example.com',
  },
  'suministros-mineros-pacifico': {
    name: 'Luis Soto',
    phone: '+51 1 000 0004',
    email: 'suministros-mineros-pacifico@example.com',
  },
  'tableros-control-peru': {
    name: 'Elena Ruiz',
    phone: '+51 1 000 0005',
    email: 'tableros-control-peru@example.com',
  },
};

function conversationSeller(id: string): ConversationSeller {
  const seller = catalog.getSeller(id)!;
  return {
    ...seller,
    yearsInIndustry: seller.years,
    locationLabel: sellerLocation(seller) + ' - ' + seller.location.country,
    ...(id === 'ldf-projects' ? { profilePath: '/proveedores/' + id } : {}),
  };
}
export const INITIAL_CONVERSATIONS_FIXTURE: readonly Conversation[] = [
  {
    id: 'ldf-projects',
    counterpart: {
      kind: 'seller',
      seller: conversationSeller('ldf-projects'),
    },
    unreadCount: 0,
    lastActivity: {
      at: '2026-11-19T14:25:00-05:00',
      preview: 'Cotización LDF-024.pdf',
      author: 'seller',
    },
  },
  {
    id: 'electro-sur-industrial',
    counterpart: {
      kind: 'seller',
      seller: conversationSeller('electro-sur-industrial'),
    },
    unreadCount: 3,
    lastActivity: {
      at: '2026-11-18T16:45:00-05:00',
      preview: 'Confirmamos que el despacho a obra en Tacna toma 48 horas hábiles.',
      author: 'seller',
    },
  },
  {
    id: 'automatizacion-andina',
    counterpart: {
      kind: 'seller',
      seller: conversationSeller('automatizacion-andina'),
    },
    unreadCount: 1,
    lastActivity: {
      at: '2026-08-15T11:30:00-05:00',
      preview: 'El motor WEG W22 IE3 de 3 kW incluye certificado de pruebas de fábrica.',
      author: 'seller',
    },
  },
  {
    id: 'suministros-mineros-pacifico',
    counterpart: {
      kind: 'seller',
      seller: conversationSeller('suministros-mineros-pacifico'),
    },
    unreadCount: 0,
    lastActivity: {
      at: '2026-08-10T09:15:00-05:00',
      preview: 'Muchas gracias por la atención, revisaremos los requerimientos en planta.',
      author: 'buyer',
    },
  },
  {
    id: 'tableros-control-peru',
    counterpart: {
      kind: 'seller',
      seller: conversationSeller('tableros-control-peru'),
    },
    unreadCount: 0,
    lastActivity: null,
  },
];

export const INITIAL_MESSAGES_BY_CONVERSATION_FIXTURE: Readonly<
  Record<string, readonly Message[]>
> = {
  'ldf-projects': [
    {
      id: 'ldf-msg-1',
      conversationId: 'ldf-projects',
      kind: 'system',
      sentAt: '2026-11-18T10:00:00-05:00',
      event: {
        type: 'conversation-started',
        label: 'Conversación comercial iniciada con LDF Projects',
      },
    },
    {
      id: 'ldf-msg-2',
      conversationId: 'ldf-projects',
      kind: 'text',
      author: 'buyer',
      sentAt: '2026-11-18T10:04:00-05:00',
      body: 'Buenos días, estamos evaluando interruptores termomagnéticos C60H-DC y celdas SM6 para una ampliación de subestación.',
    },
    {
      id: 'ldf-msg-3',
      conversationId: 'ldf-projects',
      kind: 'text',
      author: 'seller',
      sentAt: '2026-11-18T10:12:00-05:00',
      body: 'Buenos días. Con gusto los ayudamos con el dimensionamiento y la disponibilidad de la línea Schneider Electric.',
    },
    {
      id: 'ldf-msg-4',
      conversationId: 'ldf-projects',
      kind: 'text',
      author: 'buyer',
      sentAt: '2026-11-19T14:18:00-05:00',
      body: 'Perfecto. ¿Tienen stock disponible para entrega esta semana en San Isidro?',
    },
    {
      id: 'ldf-msg-5',
      conversationId: 'ldf-projects',
      kind: 'text',
      author: 'seller',
      sentAt: '2026-11-19T14:22:00-05:00',
      body: 'Buen día. Claro, contamos con disponibilidad inmediata en almacén de Lima.',
    },
    {
      id: 'ldf-photo-w22',
      conversationId: 'ldf-projects',
      kind: 'attachment',
      author: 'seller',
      sentAt: '2026-11-19T14:24:00-05:00',
      resourceIds: ['ldf-w22-photo'],
    },
    {
      id: 'ldf-quote-024',
      conversationId: 'ldf-projects',
      kind: 'quotation',
      currency: 'PEN',
      lines: [
        { product: 'Interruptor C60H-DC', quantity: 4, unitPriceCents: 5000 },
        { product: 'Celda SM6 QM', quantity: 1, unitPriceCents: 2000000 },
      ],
      author: 'seller',
      sentAt: '2026-11-19T14:25:00-05:00',
      resourceId: 'ldf-024-pdf',
      summary: 'Interruptores C60H-DC y celdas SM6',
      status: 'pending',
    },
  ],
  'electro-sur-industrial': [
    {
      id: 'esi-msg-1',
      conversationId: 'electro-sur-industrial',
      kind: 'system',
      sentAt: '2026-11-18T15:10:00-05:00',
      event: {
        type: 'conversation-started',
        label: 'Conversación comercial iniciada con Electro Sur Industrial',
      },
    },
    {
      id: 'esi-msg-2',
      conversationId: 'electro-sur-industrial',
      kind: 'text',
      author: 'buyer',
      sentAt: '2026-11-18T15:12:00-05:00',
      body: 'Buenas tardes, necesitamos confirmar el tiempo de envío hacia Tacna para dos celdas de seccionamiento.',
    },
    {
      id: 'esi-msg-3',
      conversationId: 'electro-sur-industrial',
      kind: 'text',
      author: 'seller',
      sentAt: '2026-11-18T16:40:00-05:00',
      body: 'Buenas tardes, gracias por comunicarse con Electro Sur Industrial.',
    },
    {
      id: 'esi-msg-4',
      conversationId: 'electro-sur-industrial',
      kind: 'text',
      author: 'seller',
      sentAt: '2026-11-18T16:42:00-05:00',
      body: 'El embalaje industrial para transporte terrestre está incluido sin costo adicional.',
    },
    {
      id: 'esi-msg-5',
      conversationId: 'electro-sur-industrial',
      kind: 'text',
      author: 'seller',
      sentAt: '2026-11-18T16:45:00-05:00',
      body: 'Confirmamos que el despacho a obra en Tacna toma 48 horas hábiles.',
    },
  ],
  'automatizacion-andina': [
    {
      id: 'aa-msg-1',
      conversationId: 'automatizacion-andina',
      kind: 'text',
      author: 'buyer',
      sentAt: '2026-08-15T11:15:00-05:00',
      body: 'Hola, ¿el motor WEG W22 de 3 kW viene con carcasa de hierro fundido 100L?',
    },
    {
      id: 'aa-contact-1',
      conversationId: 'automatizacion-andina',
      kind: 'contact-info',
      author: 'seller',
      sentAt: '2026-08-15T11:29:00-05:00',
      contact: SELLER_CONTACTS['automatizacion-andina'],
    },
    {
      id: 'aa-msg-2',
      conversationId: 'automatizacion-andina',
      kind: 'text',
      author: 'seller',
      sentAt: '2026-08-15T11:30:00-05:00',
      body: 'El motor WEG W22 IE3 de 3 kW incluye certificado de pruebas de fábrica.',
    },
  ],
  'suministros-mineros-pacifico': [
    {
      id: 'smp-msg-1',
      conversationId: 'suministros-mineros-pacifico',
      kind: 'text',
      author: 'seller',
      sentAt: '2026-08-10T09:05:00-05:00',
      body: 'Atendemos pedidos corporativos a partir de 12 unidades por ítem.',
    },
    {
      id: 'smp-msg-2',
      conversationId: 'suministros-mineros-pacifico',
      kind: 'text',
      author: 'buyer',
      sentAt: '2026-08-10T09:15:00-05:00',
      body: 'Muchas gracias por la atención, revisaremos los requerimientos en planta.',
    },
  ],
  'tableros-control-peru': [],
};
