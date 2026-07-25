# Copies de landing — Kraft Envíos (es-MX) · v2 unificada

**Fecha:** 2026-07-24
**Fuentes:** escaneo de `kraft-envios-fe` (features, constantes de copy, rutas BFF, `DESIGN.md`, `REPO_CONTEXT.md`) + documento de copies del backend (`src/quotes`, `src/guides`, `src/balance`, `src/addresses`, `src/users`, `emails/`).
**Estado:** copy consolidado. Los conflictos entre frontend y backend están marcados con 🔴 y **bloquean publicación** hasta resolverse.

## Cómo leer las marcas

| Marca | Significado |
| --- | --- |
| ✅ | Confirmado por backend **y** frontend. Publicable. |
| 🟡 BE | Existe en backend, **sin UI en el frontend todavía**. No publicar hasta que exista la pantalla. |
| 🟢 FE | Existe en el frontend y no aparecía en el doc de backend. Publicable, vale la pena destacarlo. |
| 🔴 | Frontend y backend se contradicen. Resolver antes de publicar. |
| ⚠️ negocio | Ni FE ni BE lo definen. Decisión de negocio. |

**Regla de tono:** claro y directo, trato de "tú", español de México, moneda MXN. Nada de "el mejor", "líder", "revolucionario". Hablar de dinero y de tiempo, no de tecnología.

---

## 0. Estado de la verdad: qué podemos prometer hoy

### ✅ Confirmado por ambos lados

| Capacidad | Evidencia FE | Evidencia BE |
| --- | --- | --- |
| Cotización comparada por CP origen/destino, peso y medidas | `features/Quotes`, `/api/quotes` | `src/quotes` |
| 7 paqueterías | `QUOTE_COURIERS` | Estafeta, DHL, UPS, FedEx, Paquetexpress, AMPM, Tres Guerras |
| Servicio estándar y día siguiente | `QUOTE_SERVICE_TYPES` | idem |
| Generación de guía con folio único | `kraftId` en `Guides-DB` | `KFT-YYYYMM-NNNNNN` |
| Número de rastreo de la paquetería | `trackingNumber` | idem |
| La guía se guarda aunque el proveedor falle | `GUIDE_DB_PROVIDER_FAILED_MESSAGE` | envío guardado con motivo del error |
| Libreta de direcciones con alias | `features/Addresses` | `src/addresses` |
| Saldo prepago en MXN + solicitudes de recarga | `features/Balance`, `/api/balance` | `src/balance` |
| Aprobación/rechazo administrativo con notificación por correo | cola admin + deep link | `emails/` |
| Cancelar solicitud mientras siga pendiente | `/api/balance/requests/[id]/cancel` | idem |
| Cotizar requiere sesión | `/api/quotes` exige token | `JwtGuard` |

### 🟢 Solo en el frontend — vale la pena vender, el doc de backend no los menciona

- **Autocompletado de colonia, ciudad y estado por código postal** (`/api/address-info`). Es de los ahorros de captura más visibles y no aparecía en el copy de backend.
- **Búsqueda de clave de producto SAT integrada** (`/api/product-sat`).
- **Copiar varias cotizaciones para compartirlas** por WhatsApp o correo (`QuotesSubscreen` → "Cotizaciones copiadas").
- **Historial de guías filtrable por mes/año o por rango de fechas exacto**, con paginación.
- **Wizard nombrado de 4 pasos:** Remitente → Destinatario → Paquete → Confirmar (`CREATE_GUIDE_STEPS`).
- **Cotización de sobres** con medidas por defecto, además de cajas.
- **Modo claro y oscuro** persistente.
- **Panel admin con margen de ganancia por proveedor** (`features/ProfitMargin`).

### 🟡 En backend, sin UI en el frontend

No publicar estos bloques hasta que exista la pantalla; hoy el usuario llegaría a un vacío.

1. **Descarga de etiqueta en PDF.** El backend la entrega; en el FE no hay evidencia de descarga ni de campo de etiqueta en `guides.types.ts` (solo `trackingNumber`). **Es la promesa más grande del hero de backend y hoy el FE no la cumple.**
2. **Estados de seguimiento (8 estados).** El FE solo modela `created` / `failed` en Guides-DB. Los estados En tránsito / En reparto / Entregada / Devuelta / Con incidencia / En espera no tienen representación en la UI.
3. **Botón "Actualizar estatus con la paquetería"** (sincronización bajo demanda).
4. **Reintento de generación** con cooldown de 5 min y tope de 10 intentos. El FE muestra el fallo pero no expone el reintento.
5. **Cotización vencida.** `docs/guide-db-existing-guide-quote-flow.md` lo tiene como trabajo futuro explícito.

### 🔴 Conflictos que bloquean publicación

**🔴 1 — Referencia de transferencia en la solicitud de recarga.**
El copy de backend pide al usuario "Referencia de transferencia (opcional)" al solicitar saldo. Pero el BFF del frontend (`/api/balance` POST) **reenvía únicamente `{ amount }`** — cualquier referencia capturada por el usuario se descarta en el camino. Además, en el FE la referencia de pago la escribe **el administrador al aprobar** (`BALANCE_DECISION_REFERENCE_LABEL`, placeholder `Ej. KRF-843210`), no el usuario al solicitar.
→ **Decidir:** ¿la referencia la pone el usuario, el admin, o ambos? De eso depende el microcopy de la sección 5.5. Hoy el copy de backend describe un campo que no llega al servidor.

**🔴 2 — "Cotizar sin registrarme".**
El backend mismo lo marca: `/quotes` está detrás de `JwtGuard`, y el BFF del FE también exige token. El CTA secundario del cierre no puede existir tal cual.
→ **Resuelto en este doc:** sustituido por "Crear cuenta y cotizar". No usar la variante sin registro.

**🔴 3 — "Sin mensualidad. Pagas solo los envíos que generas."**
Ni el backend ni el frontend modelan planes o suscripciones. Ambos documentos lo marcaron como no confirmado y, aun así, ambos lo pusieron en el hero.
→ **No publicar** hasta que negocio lo confirme por escrito. Alternativa segura ya aplicada abajo: "Crea tu cuenta gratis y cotiza sin compromiso."

**🔴 4 — "El precio que veo es el final."**
El FE aplica ajustes de margen por proveedor (`qAdjFactor`, `qAdjBasis`, `qAdjMode`) y tiene una vista de "precio interno" solo para admins. Funcionalmente la afirmación se sostiene —lo que ve el usuario es lo que se cobra— pero conviene que negocio la valide antes de ponerla como garantía en la FAQ.

### ⚠️ negocio — respuestas parciales, pendientes de confirmación

**Resuelto ✅**
1. Modelo comercial: Se paga lo que cuesta la guía en base al saldo disponible (sin suscripciones ni planes).
2. Métodos de pago: Transferencia bancaria.
3. Métricas publicables: No hay métricas publicables de momento.
4. ¿El alta de cuenta es inmediata? Sí, es inmediata.

**Pendiente de confirmación ⏳** — ver `/docs/improvement.md`
5. Tiempo real de aprobación de una recarga (para dar un número en la FAQ).
6. Datos de contacto y soporte: correo, WhatsApp, horario.
7. Aviso de privacidad y términos y condiciones.
8. Derecho de uso de los logos de las paqueterías.

---

## 1. Meta / SEO

- **Title (≤60):** Kraft Envíos | Cotiza y genera guías con varias paqueterías
- **Meta description (≤155):** Compara precios de Estafeta, DHL, FedEx, UPS y más en una sola cotización. Genera tu guía y administra todos tus envíos desde un solo lugar.
- **OG title:** Un solo lugar para cotizar, enviar y administrar tus envíos
- **OG description:** Kraft Envíos reúne varias paqueterías en una plataforma: cotizas, eliges el precio que te conviene y generas tu guía en minutos.
- **Palabras clave naturales:** cotizar envíos, generar guía, comparar paqueterías, etiqueta de envío, envíos en México, cotizador de envíos.

> Nota: el doc de backend proponía "cotiza, envía y **rastrea**". Se retiró "rastrea" del meta hasta que exista la UI de seguimiento (🟡 BE #2). Reponer la palabra en cuanto se implemente — es fuerte para SEO.

**Alt text sugerido:**
- Hero: `Panel de Kraft Envíos mostrando cotizaciones de varias paqueterías para un mismo envío`
- Guías: `Formulario de creación de guía en cuatro pasos: remitente, destinatario, paquete y confirmación`
- Saldo: `Pantalla de saldo disponible y solicitudes de recarga`

---

## 2. Hero

**H1 (variante A — recomendada)**
> Cotiza con varias paqueterías. Genera tu guía en minutos.

**H1 (variante B)**
> El mismo envío, al mejor precio disponible.

**H1 (variante C)**
> Todas tus paqueterías, una sola plataforma.

**Subtítulo (A — recomendado)**
> Compara tarifas de Estafeta, DHL, FedEx, UPS, Paquetexpress y más con un código postal y las medidas de tu paquete. Eliges, generas la guía y la administras desde tu panel.

**Subtítulo (B)**
> Ingresa origen, destino, peso y medidas. Te mostramos las opciones disponibles con su precio final y tú decides con cuál enviar.

**CTA primario:** Crear cuenta y cotizar 🔴 *(no "Cotizar mi envío" a secas: cotizar exige sesión, y mandar a un formulario que rebota a login quema la conversión)*
**CTA secundario:** Ver cómo funciona
**CTA alterno (usuarios registrados):** Entrar a mi cuenta

**Microcopy bajo CTA:**
> Crea tu cuenta gratis y cotiza sin compromiso.

🔴 No usar "Sin mensualidad. Pagas solo los envíos que generas." hasta confirmación de negocio.

**Línea de confianza bajo el hero:**
> Estafeta · DHL · FedEx · UPS · Paquetexpress · AMPM · Tres Guerras

---

## 3. Barra de valor (3 bullets)

**Versión publicable hoy:**

1. **Un formulario, varias cotizaciones** — Código postal, peso y medidas. Nada más.
2. **Guías en cuatro pasos** — Remitente, destinatario, paquete y confirmación. Sin recapturar lo que ya guardaste.
3. **Todo en un panel** — Historial de guías, direcciones frecuentes y saldo disponible en un solo lugar.

**Versión objetivo** *(activar cuando existan 🟡 BE #1 y #2):*

1. **Un formulario, varias cotizaciones** — Código postal, peso y medidas. Nada más.
2. **Guía y etiqueta al instante** — Genera la guía y descarga tu etiqueta lista para imprimir.
3. **Seguimiento en un solo tablero** — Todos tus envíos con su estatus actualizado.

---

## 4. Cómo funciona

**Título:** Enviar no tiene que ser complicado
**Subtítulo:** Cuatro pasos, de la cotización a la guía generada.

**Paso 1 — Cotiza**
Ingresa el código postal de origen y destino, el peso y las medidas de tu paquete. En segundos ves las opciones disponibles con su precio.

**Paso 2 — Elige**
Compara servicio estándar y entrega al día siguiente. Eliges la paquetería y la tarifa que más te convenga. Si necesitas consultarlo con alguien, copias las cotizaciones y las compartes. 🟢 FE

**Paso 3 — Genera tu guía**
Remitente, destinatario, datos del paquete y confirmación. Las direcciones que ya tienes guardadas se llenan solas y la colonia se autocompleta con el código postal. Tu guía queda registrada con un folio único. 🟢 FE

**Paso 4 — Administra**
Consulta tus guías cuando las necesites, filtra por mes o por rango de fechas, y revisa tu saldo y tus movimientos desde el mismo panel. 🟢 FE

> **Paso 4 — versión objetivo** *(cuando exista 🟡 BE #2):* Consulta el estatus de cada envío: en tránsito, en reparto, entregado o devuelto. Todo desde tu panel.

---

## 5. Bloques de funcionalidad

### 5.1 Cotización comparada ✅

**Título:** Compara antes de enviar
**Copy:**
> No revises paquetería por paquetería. Con un solo formulario consultamos varias opciones a la vez y te mostramos el precio final de cada una, ya con todo incluido.

**Bullets:**
- Cotiza con código postal de origen y destino
- Peso y dimensiones (largo, ancho, alto)
- Servicio estándar o entrega al día siguiente
- Cotiza cajas o sobres, con medidas estándar precargadas 🟢 FE
- Copia varias cotizaciones y compártelas con tu cliente 🟢 FE

**Variante corta (card):**
> Un formulario. Varias paqueterías. El precio final de cada una.

---

### 5.2 Generación de guías ✅ / etiquetas 🟡 BE

**Título (publicable hoy):** Tu guía, sin recapturar nada
**Copy:**
> Al confirmar tu cotización generamos la guía con la paquetería que elegiste. Cada envío recibe un folio propio de Kraft para que lo identifiques fácil, junto con el número de rastreo de la paquetería.

**Bullets:**
- Cuatro pasos guiados: remitente, destinatario, paquete y confirmación 🟢 FE
- Folio único por envío (ejemplo: KFT-202607-000123)
- Número de rastreo de la paquetería
- Búsqueda de clave de producto SAT integrada 🟢 FE
- Guarda el contenido y el valor declarado de tu paquete

**Título (versión objetivo, 🟡 BE #1):** Tu guía, lista para imprimir
**Copy objetivo:**
> Al confirmar tu cotización generamos la guía con la paquetería que elegiste y te entregamos la etiqueta en PDF.
**Bullet a añadir:** Etiqueta descargable e imprimible

> ⚠️ El folio (`KFT-YYYYMM-NNNNNN`) y el número de rastreo son cosas distintas. Nunca llamar "número de rastreo" al folio ni al revés, ni en la landing ni en la UI.

---

### 5.3 Historial de envíos ✅ / seguimiento 🟡 BE

**Título (publicable hoy):** Todas tus guías, ordenadas
**Copy:**
> Consulta el historial completo de lo que has enviado. Filtra por mes y año, o por un rango de fechas exacto, y abre el detalle de cualquier guía cuando lo necesites.
**Bullets:** 🟢 FE
- Filtro por mes o por rango de fechas
- Detalle completo de cada envío con folio y rastreo
- Paginación para historiales largos

**Versión objetivo (🟡 BE #2) — Título:** Sabes dónde va cada paquete
**Copy objetivo:**
> Todos tus envíos en una sola lista, con su estatus actualizado directo desde la paquetería.

**Etiquetas de estado a usar en la UI cuando se implemente** (respetar estas exactas, vienen del backend):
Creada · En espera · En tránsito · En reparto · Entregada · Devuelta · Con incidencia · Fallida

**Microcopy de sincronización:** "Actualizar estatus con la paquetería"

---

### 5.4 Reintentos cuando algo falla ✅ parcial

El comportamiento existe en ambos lados; lo que falta en el FE es exponer el botón de reintento.

**Título:** Si la paquetería falla, no pierdes el envío
**Copy:**
> A veces la paquetería no responde o rechaza la solicitud. Tu envío queda guardado con el motivo del error y puedes reintentarlo sin volver a capturar los datos.

**Microcopy** 🟡 BE *(el cooldown y el tope no tienen UI en el FE):*
- "Reintentar generación"
- "Podrás reintentar en unos minutos." *(cooldown de 5 min)*
- "Este envío alcanzó el máximo de intentos. Escríbenos y lo revisamos contigo." *(al llegar a 10)*

**Copy que el FE ya usa y conviene mantener consistente:**
> "La guía se guardó en Kraft, pero el proveedor no pudo crearla. Intenta más tarde o contacta a soporte."

---

### 5.5 Saldo 🔴 (ver conflicto #1)

**Título:** Carga saldo y envía sin fricción
**Copy:**
> Agrega saldo a tu cuenta y cada guía que generes se descuenta automáticamente. Sin capturar tarjeta en cada envío.

**Bullets — versión alineada al frontend actual:**
- Solicita una recarga indicando el monto
- Recibes confirmación por correo cuando se aprueba, con la referencia de pago
- Consulta tu saldo disponible en todo momento
- Cancela una solicitud mientras siga pendiente

**Microcopy — versión alineada al frontend actual:**
- "Saldo disponible"
- "Solicitar recarga"
- "Monto a recargar (MXN)"
- "Tu solicitud está en revisión. Te avisamos por correo en cuanto se apruebe."
- "Saldo insuficiente para generar esta guía. Solicita una recarga para continuar."

🔴 El doc de backend incluía además el campo **"Referencia de transferencia (opcional)"** en la solicitud. Ese campo hoy **no llega al backend**: el BFF reenvía solo `{ amount }`. Y en el FE la referencia de pago la captura el administrador al aprobar. Antes de reponer ese bullet hay que decidir de quién es el campo y, si es del usuario, abrir el paso en el BFF.

**Copy ya vivo en la app que la landing debe respetar** (estados de solicitud): Pendiente · Aprobada · Rechazada · Cancelada.

---

### 5.6 Libreta de direcciones ✅

**Título:** Captura una vez, usa siempre
**Copy:**
> Guarda tus remitentes y destinatarios frecuentes con un alias. La próxima vez los eliges de la lista y listo. Y al escribir el código postal, la colonia, ciudad y estado se completan solos.

**Bullets:**
- Alias para encontrar la dirección en un segundo
- Autocompletado de colonia, ciudad y estado por CP 🟢 FE
- Referencias y número interior para entregas complicadas 🟢 FE

**Microcopy:**
- "Guardar esta dirección"
- "Alias (ej. Bodega Centro)"
- "Usar una dirección guardada"

---

### 5.7 Cuentas y equipo ✅

**Título:** Tu operación, ordenada
**Copy:**
> Cada usuario ve sus propios envíos y su propio saldo. Los administradores tienen visibilidad completa para dar soporte cuando hace falta, revisar las solicitudes de recarga y configurar los márgenes por proveedor.

> El detalle del margen de ganancia por proveedor es 🟢 FE. Evaluar si conviene mencionarlo en una landing pública o dejarlo solo para material de venta B2B — expone cómo se construye el precio.

---

### 5.8 Detalles que se agradecen 🟢 FE

**Título:** Pensado para el uso diario
**Bullets:**
- Funciona igual en escritorio, tableta y celular
- Modo claro y modo oscuro, como prefieras trabajar
- Fechas y cortes de mes en horario del centro de México

---

## 6. Para quién es

**Título:** Hecho para quien envía todos los días

**Card 1 — Tiendas en línea**
> Cotiza por pedido y elige la tarifa que protege tu margen. Sin salir de una sola pantalla.

**Card 2 — Negocios que venden en marketplaces**
> Genera guías en volumen y mantén el histórico de cada envío con su folio y su rastreo.

**Card 3 — Pymes y emprendedores**
> Sin contratos con cada paquetería ni volúmenes mínimos. Cargas saldo y envías.

**Card 4 — Negocios que venden por redes** 🟢 FE
> Copia la cotización y mándasela a tu cliente por WhatsApp sin salir del panel.

---

## 7. Sección de paqueterías

**Título:** Las paqueterías que ya conoces
**Subtítulo:** Trabajamos con las principales redes de entrega en México para que compares sin cambiar de plataforma.
**Nota al pie (obligatoria):** La disponibilidad de cada paquetería y servicio depende del origen, el destino y las características de tu paquete.

*(Logos: Estafeta, DHL, UPS, FedEx, Paquetexpress, AMPM, Tres Guerras)*

> La nota al pie no es opcional: las paqueterías disponibles se resuelven en tiempo real según `GlobalConfigs`, así que los logos son referenciales. ⚠️ negocio — confirmar derecho de uso de los logos; si no lo hay, dejar la lista en texto.

---

## 8. Cierre (CTA final)

**Título (A):** Tu próximo envío empieza aquí
**Título (B):** Cotiza tu primer envío en menos de un minuto
**Copy:**
> Crea tu cuenta, ingresa los datos de tu paquete y compara. Sin compromiso y sin instalar nada.
**CTA primario:** Crear mi cuenta
**CTA secundario:** Iniciar sesión

🔴 No usar "Cotizar sin registrarme": cotizar exige sesión en backend (`JwtGuard`) y en el BFF del frontend.

**Variante corta para banner intermedio:**
> Deja de cotizar paquetería por paquetería. → **Crear cuenta**

---

## 9. Preguntas frecuentes

**¿Qué necesito para cotizar?**
El código postal de origen y destino, más el peso y las medidas (largo, ancho y alto) de tu paquete. También puedes cotizar sobres con medidas estándar.

**¿Necesito crear una cuenta para cotizar?**
Sí. El registro es gratis y te toma menos de un minuto.

**¿Con qué paqueterías puedo enviar?**
Trabajamos con Estafeta, DHL, UPS, FedEx, Paquetexpress, AMPM y Tres Guerras. Las opciones que veas dependen de tu ruta y del tamaño de tu paquete.

**¿Necesito tener cuenta con cada paquetería?**
No. Cotizas y generas tus guías directamente desde Kraft Envíos con tu saldo.

**¿El precio que veo es el final?** 🔴
Sí. La tarifa que aparece en la cotización es la que se cobra al generar la guía. *(Validar con negocio antes de publicarlo como garantía; el sistema aplica ajustes de margen por proveedor.)*

**¿Cómo pago mis envíos?**
Cargas saldo a tu cuenta mediante una solicitud de recarga. Una vez aprobada, cada guía se descuenta de tu saldo disponible.

**¿Cuánto tarda en aprobarse mi recarga?**
En cuanto validamos la transferencia te llega un correo confirmando la aprobación y el saldo se refleja en tu cuenta. ⚠️ negocio — dar un tiempo concreto en cuanto exista.

**¿Puedo cancelar una solicitud de saldo?**
Sí, mientras siga en estatus pendiente.

**¿Qué pasa si falla la generación de mi guía?**
El envío se guarda con el motivo del error y puedes reintentarlo desde tu panel sin volver a capturar los datos.

**¿Dónde veo mis guías anteriores?**
En la sección "Ver guías", con filtro por mes y año o por rango de fechas.

**¿Guardan mis direcciones frecuentes?**
Sí. Puedes guardarlas con un alias y reutilizarlas en cualquier cotización. Además, al escribir el código postal se completan solas la colonia, la ciudad y el estado.

**¿Envían a todo México / hacen envíos internacionales?** ⚠️
Responder solo cuando negocio confirme cobertura. Todo lo que hay en el código apunta a operación nacional: CP mexicanos, RFC y clave de producto SAT.

### FAQs a activar cuando exista la UI 🟡 BE

**¿Dónde descargo mi etiqueta?** *(🟡 BE #1)*
En el detalle del envío, una vez que la guía se generó correctamente.

**¿Puedo rastrear mis envíos?** *(🟡 BE #2 y #3)*
Sí. Cada envío muestra su estatus y su número de rastreo, y puedes actualizarlo con la paquetería desde el detalle.

---

## 10. Microcopy transversal

### Formulario de cotización
- "Código postal de origen" · placeholder `72000` · ayuda: "5 dígitos"
- "Código postal de destino" · placeholder `94298`
- "Peso (kg)"
- "Largo (cm)" / "Ancho (cm)" / "Alto (cm)"
- Botón: "Ver precios"

### Validaciones
Usar las cadenas que **ya existen** en `addresses.constants.ts` para no tener dos redacciones del mismo error:
- `"El código postal es requerido"`
- `"El código postal debe tener 5 caracteres"`
- `"El código postal solo puede contener dígitos"`
- `"Colonia es requerida"`
- Nuevas: "Ingresa un peso mayor a cero." · "Completa las medidas de tu paquete."

### Estados vacíos
- Sin envíos: "Aún no tienes envíos. Cotiza el primero y aparecerá aquí."
- Sin direcciones: "Guarda tus direcciones frecuentes para no capturarlas cada vez."
- Sin resultados: "No encontramos opciones para esta ruta y estas medidas. Revisa los datos o prueba con otro código postal."
- Sin solicitudes de saldo *(ya en la app)*: "No tienes solicitudes todavía." / "Cuando solicites saldo, podrás revisar aquí su avance y los datos de pago."

### Estados de carga
- "Consultando paqueterías…"
- "Generando tu guía…"
- Ya en la app: "Cargando solicitudes…"

### Errores
- Genérico: "Algo salió mal de nuestro lado. Inténtalo de nuevo en unos momentos."
- Conexión *(ya en la app, mantener)*: "Ocurrió un problema al consultar la información. Revisa tu conexión e inténtalo de nuevo."
- Cotización vencida 🟡 BE: "Esta cotización ya venció. Vuelve a cotizar para continuar."
- Sesión: "Tu sesión expiró. Inicia sesión de nuevo para continuar."
- Sin saldo: "No tienes saldo suficiente. Solicita una recarga para generar esta guía."

### Éxito
- "¡Listo! Tu guía se generó con el folio {kraftId}."
- "Dirección guardada."
- "Solicitud de recarga enviada. Te avisamos por correo."

### Registro (landing)
- Placeholder correo: `tu@correo.com`
- Ayuda: "Te enviaremos la confirmación a este correo."
- Éxito: "Listo. Revisa tu correo para activar tu cuenta." ⚠️ negocio — confirmar si hay verificación.
- Error: "No pudimos crear tu cuenta. Inténtalo de nuevo."

---

## 11. Correos

Alineados a las tres plantillas existentes en `emails/`.

**Restablecer contraseña**
- Asunto: Restablece tu contraseña de Kraft Envíos
- Cuerpo: "Recibimos una solicitud para restablecer tu contraseña. Da clic en el botón para crear una nueva. Si no fuiste tú, ignora este correo."
- CTA: Crear nueva contraseña

**Nueva solicitud de saldo (admin)**
- Asunto: Nueva solicitud de saldo — {monto}
- Cuerpo: "{nombre} solicitó agregar saldo a su cuenta."
- CTA: Revisar solicitud
- El CTA lleva al deep link `/dashboard/requests/{requestId}`, ya implementado en el FE.

**Decisión de solicitud (usuario)**
- Asunto aprobada: Tu recarga de {monto} fue aprobada
- Cuerpo: "Ya puedes usar tu saldo para generar guías."
- Asunto rechazada: No pudimos aprobar tu solicitud de saldo
- Cuerpo: "Motivo: {razón}. Si crees que es un error, responde a este correo."
- CTA: Ver mi saldo

> El FE ya advierte al admin que el motivo se publica: "El usuario verá este motivo en su historial y en el correo de decisión." El correo de rechazo debe seguir mostrando ese texto tal cual lo escribió el admin.

---

## 12. Navegación y footer

**Nav:** Cómo funciona · Paqueterías · Precios ⚠️ · Preguntas frecuentes · Iniciar sesión · **Crear cuenta**

> Quitar "Precios" del nav mientras no exista la sección; un ancla a una página vacía cuesta más que la ausencia del enlace.

**Footer — tagline:**
> Kraft Envíos — Cotiza, envía y administra tus envíos desde un solo lugar.
> *(Versión objetivo con seguimiento: "Cotiza, envía y rastrea desde un solo lugar.")*

**Footer — columnas:**
- **Producto:** Cotizar · Cómo funciona · Paqueterías · Preguntas frecuentes
- **Cuenta:** Iniciar sesión · Crear cuenta · Mi saldo
- **Legal:** Aviso de privacidad · Términos y condiciones ⚠️
- **Contacto:** Correo de soporte · Horario de atención ⚠️

**Aviso legal al pie (obligatorio):**
> Kraft Envíos no es una empresa de paquetería. Operamos como intermediario tecnológico entre tú y las paqueterías con las que trabajamos. Los tiempos de entrega y coberturas los define cada paquetería.

**Línea final:** © 2026 Kraft Envíos. Todos los derechos reservados.

---

## 13. Guía de tono

- **Voz:** directa, de negocio a negocio, sin corporativismo. Como un colega que ya resolvió el problema.
- **Persona:** tuteo (`tu envío`, `tus guías`), consistente con el copy que ya vive en la app.
- **Español de México:** *paquetería* (no "transportista"), *guía* (no "etiqueta" — la etiqueta es el PDF), *código postal* / *CP*, *colonia*, *saldo*, *folio*.
- **Frases cortas.** Un beneficio por oración. Verbo al frente.
- **Evita:** "solución integral", "revoluciona", "potencia tu negocio", "sinergia", "el mejor", "líder", exclamaciones en cadena.
- **Números concretos:** "7 paqueterías", "4 pasos", "$1,250 MXN". Nunca "muchas" ni "rápido".
- **Moneda:** MXN con `Intl.NumberFormat('es-MX')`, igual que las plantillas de correo.
- **Fechas:** llegan en UTC, se localizan en zona horaria de negocio (`America/Mexico_City`).
- **Consistencia con la app:** los términos de la landing deben coincidir con la interfaz — *Cotizaciones*, *Ver guías*, *Direcciones*, *Mis solicitudes*, *Saldo*, *Solicitudes de saldo*.
- **Folio ≠ rastreo.** Regla dura, en landing y en UI.

---

## 14. Checklist antes de publicar

- [ ] 🔴 Definir de quién es la "referencia de transferencia" (usuario o admin) y ajustar 5.5 y el BFF.
- [ ] 🔴 Confirmar o retirar definitivamente "sin mensualidad" del hero.
- [ ] 🔴 Validar con negocio la garantía "el precio que veo es el final".
- [ ] 🔴 Verificar que ningún CTA ofrezca cotizar sin registro.
- [ ] 🟡 Retirar de la landing toda mención a etiqueta PDF, estados de seguimiento y reintento hasta que exista la UI (secciones 3, 5.2, 5.3, 5.4, 9 y meta description).
- [ ] ⚠️ Resolver los 8 pendientes de negocio de la sección 0.
- [ ] Confirmar derecho de uso de los logos de paqueterías.
- [ ] Verificar que la nota al pie de la sección 7 y el aviso legal del footer aparezcan en la versión final.
