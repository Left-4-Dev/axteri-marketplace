import { AuthFeatureItem, AuthStepDefinition, SelectOption } from '../models/auth.model';

export const PROVIDER_REGISTER_STEPS: readonly AuthStepDefinition[] = [
  { step: 1, caption: 'Paso 1', label: 'CONTACTO' },
  { step: 2, caption: 'Paso 2', label: 'DATOS' },
  { step: 3, caption: 'Paso 3', label: 'CATEGORÍA' },
  { step: 4, caption: 'Paso 4', label: '¡LISTO!' },
] as const;

export const CUSTOMER_LOGIN_FEATURES: readonly AuthFeatureItem[] = [
  {
    id: 'chat',
    text: 'CONECTA Y COMPARTE INFORMACIÓN CLAVE EN UN SOLO CHAT.',
    assetPath: '/assets/icons/auth/feature-chat.svg',
  },
  {
    id: 'quote',
    text: 'ENCUENTRA Y COTIZA PRODUCTOS EN SEGUNDOS.',
    assetPath: '/assets/icons/auth/feature-quote.svg',
  },
  {
    id: 'verified',
    text: 'CONTACTA CON PROVEEDORES VERIFICADOS.',
    assetPath: '/assets/icons/auth/feature-verified.svg',
  },
] as const;

export const PROVIDER_REGISTER_STEP_3_FEATURES: readonly AuthFeatureItem[] = [
  {
    id: 'chat',
    text: 'CONECTA Y COMPARTE INFORMACIÓN CLAVE EN UN SOLO CHAT.',
    assetPath: '/assets/icons/auth/feature-chat.svg',
  },
  {
    id: 'quote',
    text: 'ENCUENTRA Y COTIZA PRODUCTOS EN SEGUNDOS.',
    assetPath: '/assets/icons/auth/feature-quote.svg',
  },
  {
    id: 'verified',
    text: 'CREA UNA PÁGINA A TU MEDIDA Y GENERA CONFIANZA.',
    assetPath: '/assets/icons/auth/feature-verified.svg',
  },
] as const;

export const PROVIDER_INDUSTRIES: readonly SelectOption[] = [
  { value: 'automatizacion-control', label: 'Automatización y Control Industrial' },
  { value: 'motores-transmision', label: 'Motores y Transmisión de Potencia' },
  { value: 'electricidad-energia', label: 'Electricidad y Energía Industrial' },
  { value: 'instrumentacion-medicion', label: 'Instrumentación y Medición' },
  { value: 'seguridad-industrial', label: 'Seguridad Industrial y EPP' },
  { value: 'neumatica-hidraulica', label: 'Neumática e Hidráulica' },
  { value: 'mantenimiento-suministros', label: 'Mantenimiento y Suministros MRO' },
] as const;

export const PROVIDER_SPECIALTIES: readonly SelectOption[] = [
  { value: 'fabricante-marca', label: 'Fabricante o representante oficial de marca' },
  { value: 'distribuidor-autorizado', label: 'Distribuidor mayorista / autorizado' },
  { value: 'importador-directo', label: 'Importador directo de suministros industriales' },
  { value: 'integrador-soluciones', label: 'Integrador de soluciones y proyectos B2B' },
  { value: 'comercializador-mro', label: 'Comercialización de repuestos y equipamiento' },
] as const;
