import { Conversation, Message } from '../models/messages.model';

export const INITIAL_CONVERSATIONS_FIXTURE: readonly Conversation[] = [
  {
    id: 'ldf-projects',
    counterpart: {
      kind: 'seller',
      seller: {
        id: 'ldf-projects',
        name: 'LDF Projects',
        verified: true,
        tagline: 'Soluciones eléctricas, celdas de media tensión y tableros para la industria.',
        logoUrl: '/assets/sellers/ldf-projects/logo.webp',
        sector: 'Eléctrico',
        supplierType: 'Importador',
        locationLabel: 'San Miguel, Lima - Perú',
        yearsInIndustry: 12,
        businessHours: [
          'Lunes a viernes: 9:00 a. m. - 7:00 p. m.',
          'Sábados: 9:00 a. m. - 1:00 p. m.',
        ],
        profilePath: '/proveedores/ldf-projects',
      },
    },
    unreadCount: 0,
    lastActivity: {
      at: '2026-11-19T14:22:00-05:00',
      preview: 'Buen día. Claro, contamos con disponibilidad inmediata en almacén de Lima.',
      author: 'seller',
    },
  },
  {
    id: 'electro-sur-industrial',
    counterpart: {
      kind: 'seller',
      seller: {
        id: 'electro-sur-industrial',
        name: 'Electro Sur Industrial',
        verified: true,
        tagline: 'Distribución de equipamiento eléctrico y maniobra para proyectos del sur.',
        sector: 'Energía y distribución',
        supplierType: 'Distribuidor autorizado',
        locationLabel: 'Tacna - Perú',
        yearsInIndustry: 11,
        businessHours: [
          'Lunes a viernes: 8:30 a. m. - 6:00 p. m.',
          'Sábados: 9:00 a. m. - 12:30 p. m.',
        ],
      },
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
      seller: {
        id: 'automatizacion-andina',
        name: 'Automatización Andina',
        verified: true,
        tagline: 'Motores trifásicos, variadores de frecuencia y control industrial.',
        sector: 'Automatización industrial',
        supplierType: 'Representante comercial',
        locationLabel: 'Arequipa - Perú',
        yearsInIndustry: 8,
        businessHours: ['Lunes a viernes: 8:00 a. m. - 5:30 p. m.'],
      },
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
      seller: {
        id: 'suministros-mineros-pacifico',
        name: 'Suministros Mineros del Pacífico',
        verified: false,
        tagline: 'Equipos de protección personal, instrumentación y ferretería técnica.',
        sector: 'Seguridad industrial',
        supplierType: 'Mayorista',
        locationLabel: 'Callao, Lima - Perú',
        yearsInIndustry: 6,
        businessHours: ['Lunes a viernes: 8:30 a. m. - 6:00 p. m.'],
      },
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
      seller: {
        id: 'tableros-control-peru',
        name: 'Tableros y Control Perú',
        verified: true,
        tagline: 'Integración de tableros autosoportados y centros de control de motores.',
        sector: 'Eléctrico',
        supplierType: 'Fabricante',
        locationLabel: 'Ate, Lima - Perú',
        yearsInIndustry: 15,
        businessHours: ['Lunes a viernes: 8:00 a. m. - 6:00 p. m.'],
      },
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
