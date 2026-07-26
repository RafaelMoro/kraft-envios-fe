import {
  LandingAudience,
  LandingFaqItem,
  LandingFeature,
  LandingStep,
  LandingValueBullet,
} from "@/shared/types/landing.types";

export const LANDING_COURIERS: readonly string[] = [
  'Estafeta',
  'DHL',
  'UPS',
  'FedEx',
  'Paquetexpress',
  'AMPM',
  'Tres Guerras',
]

export const LANDING_VALUE_BULLETS: readonly LandingValueBullet[] = [
  {
    num: '01',
    title: 'Un formulario, varias cotizaciones',
    body: 'Código postal, peso y medidas. Nada más.',
  },
  {
    num: '02',
    title: 'Guías en cuatro pasos',
    body: 'Remitente, destinatario, paquete y confirmación. Sin recapturar lo que ya guardaste.',
  },
  {
    num: '03',
    title: 'Todo en un panel',
    body: 'Historial de guías, direcciones frecuentes y saldo disponible en un solo lugar.',
  },
]

export const LANDING_STEPS: readonly LandingStep[] = [
  {
    num: '1',
    title: 'Cotiza',
    body: 'Ingresa el código postal de origen y destino, el peso y las medidas de tu paquete. En segundos ves las opciones disponibles con su precio.',
  },
  {
    num: '2',
    title: 'Elige',
    body: 'Compara servicio estándar y entrega al día siguiente. Eliges la paquetería y la tarifa que más te convenga. Si necesitas consultarlo con alguien, copias las cotizaciones y las compartes.',
  },
  {
    num: '3',
    title: 'Genera tu guía',
    body: 'Remitente, destinatario, datos del paquete y confirmación. Las direcciones que ya tienes guardadas se llenan solas y la colonia se autocompleta con el código postal. Tu guía queda registrada con un folio único.',
  },
  {
    num: '4',
    title: 'Administra',
    body: 'Consulta tus guías cuando las necesites, filtra por mes o por rango de fechas, y revisa tu saldo y tus movimientos desde el mismo panel.',
  },
]

export const LANDING_FEATURES: readonly LandingFeature[] = [
  {
    tag: 'COTIZACIÓN',
    title: 'Compara antes de enviar',
    body: 'No revises paquetería por paquetería. Con un solo formulario consultamos varias opciones a la vez y te mostramos el precio final de cada una, ya con todo incluido.',
    bullets: [
      'Cotiza con código postal de origen y destino',
      'Servicio estándar o entrega al día siguiente',
      'Cotiza cajas o sobres, con medidas precargadas',
      'Copia varias cotizaciones y compártelas con tu cliente',
    ],
  },
  {
    tag: 'GUÍAS',
    title: 'Tu guía, sin recapturar nada',
    body: 'Al confirmar tu cotización generamos la guía con la paquetería que elegiste. Cada envío recibe un folio propio de Kraft para que lo identifiques fácil, junto con el número de rastreo de la paquetería.',
    bullets: [
      'Cuatro pasos guiados: remitente, destinatario, paquete y confirmación',
      'Folio único por envío (ej. KFT-202607-000123)',
      'Búsqueda de clave de producto SAT integrada',
    ],
  },
  {
    tag: 'SALDO',
    title: 'Carga saldo y envía sin fricción',
    body: 'Agrega saldo a tu cuenta y cada guía que generes se descuenta automáticamente. Sin capturar tarjeta en cada envío.',
    bullets: [
      'Solicita una recarga indicando el monto',
      'Confirmación por correo cuando se aprueba',
      'Cancela una solicitud mientras siga pendiente',
    ],
  },
  {
    tag: 'DIRECCIONES',
    title: 'Captura una vez, usa siempre',
    body: 'Guarda tus remitentes y destinatarios frecuentes con un alias. La próxima vez los eliges de la lista y listo. Y al escribir el código postal, la colonia, ciudad y estado se completan solos.',
    bullets: [
      'Alias para encontrar la dirección en un segundo',
      'Autocompletado de colonia, ciudad y estado por CP',
      'Referencias y número interior para entregas complicadas',
    ],
  },
]

export const LANDING_PERKS: readonly string[] = [
  'Funciona en escritorio, tableta y celular',
  'Modo claro y modo oscuro',
  'Historial filtrable por mes o rango de fechas',
  'Si la paquetería falla, tu envío queda guardado y lo reintentas',
]

export const LANDING_AUDIENCES: readonly LandingAudience[] = [
  {
    title: 'Tiendas en línea',
    body: 'Cotiza por pedido y elige la tarifa que protege tu margen. Sin salir de una sola pantalla.',
  },
  {
    title: 'Venta en marketplaces',
    body: 'Genera guías en volumen y mantén el histórico de cada envío con su folio y su rastreo.',
  },
  {
    title: 'Pymes y emprendedores',
    body: 'Sin contratos con cada paquetería ni volúmenes mínimos. Cargas saldo y envías.',
  },
  {
    title: 'Venta por redes',
    body: 'Copia la cotización y mándasela a tu cliente por WhatsApp sin salir del panel.',
  },
]

export const LANDING_FAQS: readonly LandingFaqItem[] = [
  {
    question: '¿Qué necesito para cotizar?',
    answer: 'El código postal de origen y destino, más el peso y las medidas (largo, ancho y alto) de tu paquete. También puedes cotizar sobres con medidas estándar.',
  },
  {
    question: '¿Necesito crear una cuenta para cotizar?',
    answer: 'Sí. El registro es gratis y te toma menos de un minuto.',
  },
  {
    question: '¿Con qué paqueterías puedo enviar?',
    answer: 'Trabajamos con Estafeta, DHL, UPS, FedEx, Paquetexpress, AMPM y Tres Guerras. Las opciones que veas dependen de tu ruta y del tamaño de tu paquete.',
  },
  {
    question: '¿Necesito tener cuenta con cada paquetería?',
    answer: 'No. Cotizas y generas tus guías directamente desde Kraft Envíos con tu saldo.',
  },
  {
    question: '¿Cómo pago mis envíos?',
    answer: 'Cargas saldo a tu cuenta mediante una solicitud de recarga. Una vez aprobada, cada guía se descuenta de tu saldo disponible.',
  },
  {
    question: '¿Puedo cancelar una solicitud de saldo?',
    answer: 'Sí, mientras siga en estatus pendiente.',
  },
  {
    question: '¿Qué pasa si falla la generación de mi guía?',
    answer: 'El envío se guarda con el motivo del error y puedes reintentarlo desde tu panel sin volver a capturar los datos.',
  },
  {
    question: '¿Dónde veo mis guías anteriores?',
    answer: 'En la sección "Ver guías", con filtro por mes y año o por rango de fechas.',
  },
  {
    question: '¿Guardan mis direcciones frecuentes?',
    answer: 'Sí. Puedes guardarlas con un alias y reutilizarlas en cualquier cotización. Al escribir el código postal se completan solas la colonia, la ciudad y el estado.',
  },
]

export const LANDING_COURIER_DISCLAIMER =
  'La disponibilidad de cada paquetería y servicio depende del origen, el destino y las características de tu paquete.'

export const LANDING_LEGAL_NOTICE =
  'Kraft Envíos no es una empresa de paquetería. Operamos como intermediario tecnológico entre tú y las paqueterías con las que trabajamos. Los tiempos de entrega y coberturas los define cada paquetería.'

export const LANDING_HERO_IMAGE_ALT =
  'Panel de Kraft Envíos mostrando cotizaciones de varias paqueterías para un mismo envío'
