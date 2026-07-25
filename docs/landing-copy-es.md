# Copies de landing — Kraft Envíos (español MX)

**Fecha:** 2026-07-24
**Fuente:** escaneo del repo `kraft-envios-fe` (features, constantes de copy, rutas BFF, `DESIGN.md`, `REPO_CONTEXT.md`).
**Estado:** borrador de copy. Los bloques marcados con `⚠️ backend` requieren datos reales del backend antes de publicarse.

---

## 0. Qué hace el producto (base de verdad extraída del código)

Esto es lo que el repo confirma; todo el copy de abajo se apoya solo en esto.

| Capacidad | Evidencia en el repo |
| --- | --- |
| Cotización en varias paqueterías desde un CP origen/destino | `features/Quotes`, `/api/quotes`, `/api/address-info` |
| Paqueterías soportadas | `QUOTE_COURIERS`: Estafeta, DHL, UPS, Fedex, Paquetexpress, AMPM, NextDay, Tres Guerras |
| Servicios | `standard` y `nextDay` (`QUOTE_SERVICE_TYPES`) |
| Tipos de envío | Caja y sobre (`TYPE_PACKAGE`), con medidas de sobre por defecto |
| Generación de guías en 4 pasos | `CREATE_GUIDE_STEPS`: Remitente → Destinatario → Paquete → Confirmar |
| Historial de guías con filtros | `Guides-DB`, filtros por mes/año o rango de fechas, paginación |
| Libreta de direcciones con alias | `features/Addresses`, CRUD en `/api/address` |
| Autocompletado de colonia/estado/ciudad por CP | `features/AutocompleteZipcode`, `/api/address-info` |
| Búsqueda de producto SAT | `/api/product-sat` |
| Saldo prepago en MXN + solicitudes de saldo | `features/Balance`, `/api/balance`, `/api/balance/requests` |
| Flujo de aprobación administrativa de saldo | `/api/balance/requests/admin`, `.../decision`, correo con deep link |
| Rol administrador con margen de ganancia por proveedor | `features/ProfitMargin`, `/api/margin-profit` |
| Copiar cotizaciones para compartir | `QuotesSubscreen` → "Cotizaciones copiadas" |
| Modo claro/oscuro persistente | cookie `theme`, `ToggleDarkMode` |
| Operación en México | CP de 5 dígitos, RFC, producto SAT, zona horaria `America/Mexico_City` |

**No hay evidencia en el repo de:** recolección a domicilio, seguimiento en tiempo real dentro de la app, integraciones con e-commerce, API pública, app móvil nativa, contratos o mensualidades. **No los prometas en la landing** hasta confirmarlos con backend.

---

## 1. Hero

### Opción A — enfoque "compara y ahorra" (recomendada)

**Eyebrow:** Envíos nacionales para negocios en México

**H1:** Cotiza con todas tus paqueterías y genera tus guías en un solo lugar

**Subtítulo:**
Compara tarifas de Estafeta, DHL, FedEx, UPS, Paquetexpress y más en una sola búsqueda. Elige la mejor opción, genera tu guía en cuatro pasos y llévalas todas ordenadas desde un mismo panel.

**CTA primario:** Crear mi cuenta
**CTA secundario:** Ya tengo cuenta

**Nota de apoyo bajo los CTAs:** Sin mensualidad. Cargas saldo y pagas solo por lo que envías. `⚠️ backend` — confirmar modelo comercial.

### Opción B — enfoque "operación ordenada"

**H1:** Tu operación de envíos, sin cinco pestañas abiertas

**Subtítulo:**
Kraft Envíos junta cotización, generación de guías, direcciones frecuentes y control de saldo en un solo panel. Menos capturas repetidas, menos errores, más envíos salidos a tiempo.

### Opción C — enfoque "velocidad"

**H1:** De código postal a guía generada en minutos

**Subtítulo:**
Escribe el CP de origen y destino, compara tarifas de las principales paqueterías del país y genera la guía sin volver a capturar los mismos datos.

---

## 2. Barra de confianza (logos de paqueterías)

**Encabezado:** Cotiza con las paqueterías que ya usas
**Alternativa:** Todas tus paqueterías, una sola búsqueda

Lista: Estafeta · DHL · FedEx · UPS · Paquetexpress · AMPM · Tres Guerras

> Nota legal: usar los logos solo si hay derecho de uso confirmado. Si no, dejar la lista en texto.

---

## 3. Problema / propuesta de valor

**Título de sección:** Cotizar envíos no debería tomarte media hora

**Intro:**
Abrir el portal de cada paquetería, recapturar la misma dirección cuatro veces y anotar los precios en una hoja de cálculo no es un proceso: es una fuga de tiempo. Kraft Envíos lo resuelve en una sola pantalla.

**Tres columnas — antes / después:**

| Sin Kraft | Con Kraft |
| --- | --- |
| Un portal distinto por paquetería | Una búsqueda, todas las tarifas |
| Capturas la misma dirección en cada envío | Guardas la dirección con un alias y la reutilizas |
| No sabes cuánto llevas gastado | Saldo y movimientos siempre a la vista |
| Las guías viven en correos y descargas sueltas | Historial filtrable por mes o por rango de fechas |

---

## 4. Cómo funciona (4 pasos)

**Título:** Así funciona

**Subtítulo:** Cuatro pasos, el mismo flujo cada vez.

**Paso 1 — Cotiza**
Ingresa el código postal de origen y destino, y el peso y las medidas de tu paquete o sobre. Te mostramos las tarifas disponibles de cada paquetería, en servicio estándar y de día siguiente.

**Paso 2 — Compara y elige**
Todas las opciones en una sola vista, con precio y tipo de servicio. Selecciona la que te conviene, o copia varias cotizaciones para compartirlas con tu cliente o tu equipo.

**Paso 3 — Genera la guía**
Remitente, destinatario, datos del paquete y confirmación. Las direcciones que ya tienes guardadas se llenan solas y la colonia se autocompleta con el código postal.

**Paso 4 — Administra**
Consulta tus guías cuando las necesites, filtra por mes o por rango de fechas y revisa tu saldo y tus movimientos desde el mismo panel.

---

## 5. Bloques de features

### 5.1 Cotización comparada

**Título:** Todas las tarifas, una sola búsqueda
**Cuerpo:**
Consulta en un solo lugar lo que cobran Estafeta, DHL, FedEx, UPS, Paquetexpress, AMPM y Tres Guerras por el mismo envío. Servicio estándar o entrega al día siguiente, para cajas y para sobres.
**Bullets:**
- Cotiza por código postal de origen y destino
- Compara servicio estándar y día siguiente lado a lado
- Copia las cotizaciones para enviarlas a tu cliente en un mensaje

### 5.2 Guías en cuatro pasos

**Título:** Genera guías sin recapturar nada
**Cuerpo:**
Un flujo guiado —remitente, destinatario, paquete y confirmación— que reutiliza lo que ya tienes guardado. Si algo falla del lado de la paquetería, la guía queda registrada en Kraft y puedes reintentarla sin empezar de cero.
**Bullets:**
- Cuatro pasos claros, sin campos duplicados
- Búsqueda de clave de producto SAT integrada
- Si el proveedor falla, tu captura no se pierde

### 5.3 Libreta de direcciones

**Título:** Guarda una dirección, úsala siempre
**Cuerpo:**
Registra tus orígenes y destinos frecuentes con un alias. Al escribir el código postal, la colonia, ciudad y estado se completan solos, así que dejas de equivocarte al capturar.
**Bullets:**
- Alias para encontrar la dirección en un segundo
- Autocompletado de colonia, ciudad y estado por CP
- Referencias y número interior para entregas complicadas

### 5.4 Historial de guías

**Título:** Todas tus guías, ordenadas
**Cuerpo:**
Consulta el historial completo de lo que has enviado. Filtra por mes y año, o por un rango de fechas exacto, y abre el detalle de cualquier guía cuando lo necesites.
**Bullets:**
- Filtro por mes o por rango de fechas
- Detalle completo de cada envío
- Paginación para historiales largos

### 5.5 Saldo prepago

**Título:** Saldo claro, sin sorpresas
**Cuerpo:**
Tu saldo disponible en pesos siempre visible en el panel. Solicitas una recarga desde la misma pantalla, sigues el estado de cada solicitud y cancelas las que aún estén pendientes.
**Bullets:**
- Saldo en MXN visible en todo momento
- Historial de solicitudes con estado: pendiente, aprobada, rechazada o cancelada
- Referencia de pago registrada en cada aprobación

### 5.6 Control administrativo

**Título:** Control para quien administra la operación
**Cuerpo:**
Los administradores revisan las solicitudes de saldo en una cola dedicada, aprueban o rechazan con referencia y motivo, y configuran el margen de ganancia por proveedor. Los correos de solicitud llevan liga directa al detalle.
**Bullets:**
- Cola de solicitudes pendientes y vista de todas
- Aprobación o rechazo con referencia de pago y motivo
- Margen de ganancia configurable por proveedor

### 5.7 Detalles que se agradecen

**Título:** Pensado para el uso diario
**Bullets:**
- Funciona igual en escritorio, tableta y celular
- Modo claro y modo oscuro, como prefieras trabajar
- Fechas y cortes de mes en horario del centro de México

---

## 6. Para quién es

**Título:** Hecho para quien envía todos los días

- **Tiendas en línea.** Cotiza antes de prometer un costo de envío y genera la guía en cuanto entra el pedido.
- **Negocios que venden por redes.** Copia la cotización y mándasela a tu cliente por WhatsApp sin salir del panel.
- **Equipos con varias personas enviando.** Cada quien con su cuenta, el saldo y las aprobaciones bajo control de quien administra.
- **Quien ya usa varias paqueterías.** Deja de entrar a un portal distinto por cada una.

---

## 7. Prueba social / métricas

`⚠️ backend` — Toda esta sección necesita datos reales. Plantillas listas para llenar:

- **[N] guías generadas** con Kraft Envíos
- **[N] paqueterías** en una sola búsqueda *(este sí es verificable: 7)*
- **[N] negocios** enviando con nosotros

**Testimonio (plantilla):**
> "Antes abría cuatro portales para cotizar un envío. Ahora lo hago una vez y ya sé cuál me conviene."
> — [Nombre], [Negocio], [Ciudad]

> No publicar cifras inventadas. Si no hay números todavía, sustituir esta sección por el bloque de "Cómo funciona" ampliado o por capturas reales del panel.

---

## 8. Precios

`⚠️ backend` — El repo no contiene lógica de planes ni de suscripción. Solo confirma un modelo de **saldo prepago recargable**. Confirmar con backend antes de escribir cifras.

**Título:** Pagas por lo que envías

**Cuerpo:**
Sin mensualidad ni contratos. Cargas saldo a tu cuenta y cada guía que generas se descuenta de ahí. Tu saldo disponible siempre visible en el panel.

**Bullets:**
- Sin cuota mensual
- Sin mínimo de envíos `⚠️ backend`
- Recargas cuando lo necesitas, desde el mismo panel

**CTA:** Crear cuenta gratis

---

## 9. FAQ

**¿Con qué paqueterías puedo cotizar?**
Estafeta, DHL, FedEx, UPS, Paquetexpress, AMPM y Tres Guerras, en servicio estándar y de día siguiente según la ruta.

**¿Necesito tener cuenta con cada paquetería?**
No. Cotizas y generas tus guías directamente desde Kraft Envíos con tu saldo.

**¿Cómo funciona el saldo?**
Cargas saldo a tu cuenta y cada guía se descuenta de ahí. Solicitas una recarga desde el panel; cuando se aprueba, el saldo se refleja junto con la referencia de pago. Puedes cancelar cualquier solicitud que siga pendiente.

**¿Cuánto tarda en aprobarse una recarga?**
`⚠️ backend` — confirmar tiempo real de respuesta.

**¿Puedo cotizar sobres además de cajas?**
Sí. Puedes cotizar sobres con medidas estándar o capturar las dimensiones de tu caja.

**¿Puedo guardar mis direcciones frecuentes?**
Sí. Guarda cada dirección con un alias y reutilízala en todos tus envíos. La colonia, ciudad y estado se autocompletan con el código postal.

**¿Dónde veo mis guías anteriores?**
En la sección "Ver guías", con filtro por mes y año o por rango de fechas.

**¿Envían a todo México?**
`⚠️ backend` — confirmar cobertura real por paquetería.

**¿Hacen envíos internacionales?**
`⚠️ backend` — el repo solo evidencia operación nacional (CP mexicanos, RFC, producto SAT).

**¿Puedo rastrear mis envíos desde Kraft?**
`⚠️ backend` — confirmar antes de responder. La app guarda el número de rastreo de la guía; validar si hay seguimiento en vivo.

---

## 10. CTA final

**Título:** Empieza a cotizar hoy
**Cuerpo:** Crea tu cuenta, carga saldo y genera tu primera guía en minutos.
**CTA primario:** Crear mi cuenta
**CTA secundario:** Iniciar sesión

**Variante corta para banner intermedio:**
Deja de cotizar paquetería por paquetería. → **Crear cuenta**

---

## 11. Navegación y pie de página

**Nav:** Cómo funciona · Paqueterías · Precios · Preguntas frecuentes · **Iniciar sesión** · **Crear cuenta**

**Footer — descripción de marca:**
Kraft Envíos es la plataforma para cotizar con varias paqueterías, generar guías y administrar tus envíos nacionales desde un solo panel.

**Columnas del footer:**
- **Producto:** Cómo funciona · Paqueterías · Precios · Preguntas frecuentes
- **Cuenta:** Iniciar sesión · Crear cuenta · Recuperar contraseña
- **Legal:** Aviso de privacidad · Términos y condiciones `⚠️ backend/legal`
- **Contacto:** `⚠️ pendiente` correo, WhatsApp, horario de atención

**Línea final:** © 2026 Kraft Envíos. Todos los derechos reservados.

---

## 12. Microcopy

**Botones**
- Primario: `Crear mi cuenta` / `Empezar ahora` / `Cotizar mi envío`
- Secundario: `Iniciar sesión` / `Ver cómo funciona`
- Terciario: `Conoce más`

**Formulario de registro (landing)**
- Placeholder correo: `tu@correo.com`
- Ayuda: `Te enviaremos la confirmación a este correo.`
- Éxito: `Listo. Revisa tu correo para activar tu cuenta.` `⚠️ backend` — confirmar si hay verificación por correo.
- Error genérico: `No pudimos crear tu cuenta. Inténtalo de nuevo.`

**Estados**
- Cargando: `Un momento...`
- Error de red: `Ocurrió un problema al conectar. Revisa tu conexión e inténtalo de nuevo.` *(consistente con el copy ya usado en la app)*

---

## 13. SEO / metadatos

**Title (≤60):** Kraft Envíos — Cotiza y genera guías con varias paqueterías

**Meta description (≤155):**
Compara tarifas de Estafeta, DHL, FedEx, UPS y más en una sola búsqueda. Genera tus guías, guarda tus direcciones y controla tu saldo desde un solo panel.

**Open Graph title:** Todas tus paqueterías en una sola búsqueda
**Open Graph description:** Cotiza, genera guías y administra tus envíos nacionales desde un solo lugar. Sin mensualidad.

**Palabras clave objetivo:** cotizador de envíos México · guías de envío en línea · comparar paqueterías · envíos para tiendas en línea · generar guía Estafeta DHL FedEx

**Alt text sugerido:**
- Hero: `Panel de Kraft Envíos mostrando cotizaciones de varias paqueterías para un mismo envío`
- Guías: `Formulario de creación de guía en cuatro pasos`
- Saldo: `Pantalla de saldo disponible y solicitudes de recarga`

---

## 14. Guía de tono

- **Voz:** directa, de negocio a negocio, sin corporativismo. Como un colega que ya resolvió el problema.
- **Persona:** tutea (`tu envío`, `tus guías`). Consistente con el copy que ya existe en la app.
- **Español de México:** *paquetería* (no "transportista"), *guía* (no "etiqueta"), *código postal* / *CP*, *colonia*, *saldo*.
- **Frases cortas.** Un beneficio por oración. Verbo al frente.
- **Evita:** "solución integral", "revoluciona", "potencia tu negocio", "sinergia", signos de exclamación en cadena.
- **Números siempre concretos:** "7 paqueterías", "4 pasos", "$1,250 MXN" — no "muchas" ni "rápido".
- **Consistencia con la app:** los términos de la landing deben coincidir con la interfaz — *Cotizaciones*, *Ver guías*, *Direcciones*, *Mis solicitudes*, *Saldo*.

---

## 15. Pendientes para cruzar con backend

1. Modelo comercial: ¿solo saldo prepago? ¿hay comisión por guía, mínimo de recarga, planes?
2. Cobertura real por paquetería y si hay envíos internacionales.
3. Tiempo de respuesta a una solicitud de recarga (para la FAQ).
4. Métodos de pago aceptados para recargar saldo.
5. Métricas publicables: guías generadas, usuarios activos, antigüedad de la empresa.
6. ¿Hay seguimiento de envío en vivo o solo se guarda el número de rastreo?
7. Registro: ¿alta inmediata o requiere aprobación/verificación por correo?
8. Datos de contacto y soporte (correo, WhatsApp, horario).
9. Textos legales: aviso de privacidad y términos.
10. Derecho de uso de los logos de las paqueterías.
