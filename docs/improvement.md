# Pendientes de confirmación para landing pública

## Puntos que requieren decisión de negocio antes de publicar

### 1. Tiempo de aprobación de recarga
**Ubicación:** FAQ, sección 9 (línea ~386)
**Estado:** Omitido de la landing por falta de número concreto
**Qué falta:** Confirmar el SLA/tiempo real de aprobación de una solicitud de saldo para comunicarlo en la FAQ
**Copy actual:** "En cuanto validamos la transferencia te llega un correo confirmando la aprobación y el saldo se refleja en tu cuenta. ⚠️ negocio — dar un tiempo concreto en cuanto exista."
**Copy objetivo:** "En cuanto validamos la transferencia [1-2 horas / 24 horas / depende del banco] te llega un correo confirmando la aprobación."

---

### 2. Datos de contacto y soporte
**Ubicación:** Footer, sección 12 (línea ~501) + FAQs
**Estado:** Omitido de la landing
**Qué falta:** Definir:
- Correo de soporte
- Canales de atención (WhatsApp, correo, chat)
- Horario de atención

**Copy a definir:** Aparecerá en columna "Contacto" del footer y como último recurso en FAQs cuando el usuario tenga un problema.

---

### 3. Aviso de privacidad y Términos y condiciones
**Ubicación:** Footer, sección 12 (línea ~500)
**Estado:** Omitido de la landing
**Qué falta:** 
- Redactar o aportar los documentos legales
- Definir si el usuario debe dar consentimiento explícito en el registro

**Copy a definir:** Links en footer a ambos documentos (obligatorio por RGPD/privacidad en México).

---

### 4. Derecho de uso de logos de paqueterías
**Ubicación:** Sección 7, línea ~345
**Estado:** Logos mostrados como referencia, nota al pie aclarada
**Qué falta:** Confirmar con cada paquetería (Estafeta, DHL, UPS, FedEx, Paquetexpress, AMPM, Tres Guerras) que está permitido usar su logo en la landing pública.
**Alternativa:** Si no hay derecho confirmado, cambiar a una lista de texto plano en lugar de logos.

#### 4.1 El screenshot del hero también contiene logos

**Ubicación:** Hero, sección 1 — `public/landing-hero-quotes.webp`
**Estado:** Se publica en el primer draft; se revisa con el cliente antes de lanzar.
**Detalle:** La imagen del hero no es una maqueta dibujada: es una **captura real del panel de cotizaciones**, así que trae el wordmark de **AMPM** y el logo de **DHL** renderizados como imagen, no como texto. Es el uso de marca más visible de toda la landing porque está *above the fold*.

Esto es distinto del punto 4 anterior: ahí hablamos de una lista de logos que decidimos poner o no. Aquí el logo viene incrustado en una captura de producto, que suele considerarse uso descriptivo/referencial (mostramos nuestra propia herramienta funcionando) y no uso de marca en material promocional. Aun así conviene plantearlo explícitamente al cliente junto con el punto 4.

**Además la captura fija datos concretos que envejecen:**
- Tres precios literales: `$103.91` (AMPM Servicio estándar), `$136.72` (DHL Economy Select Domestic), `$139.37` (DHL Express SMART).
- Nombres de servicio tal cual los devuelve cada proveedor, incluido un glifo suelto en `DHL Express 🟡SMART`.
- El badge flotante del comp dice `folio KFT-202607-000123`, que incluye el mes `202607` y se leerá como viejo en 2027.

**Si el cliente no aprueba los logos, en orden de costo:**
1. Volver a capturar el panel con los logos ocultos (CSS temporal) — más barato.
2. Sustituir los logos por los nombres en texto plano dentro de la captura.
3. Reconstruir la maqueta en HTML/CSS con nombres de texto — es la opción más limpia a largo plazo y además elimina el problema de los precios fijos, pero es trabajo real de UI.

---

### 5. Datos que envejecen en el hero

**Ubicación:** Hero, sección 1
**Estado:** Aceptado para el primer draft
**Qué falta:** Decidir con el cliente si los precios y el folio del hero se refrescan periódicamente o si la maqueta se reconstruye en markup para que deje de ser una foto. Ver 4.1 para el detalle. Si se reconstruye, también se resuelve el problema de mantenimiento del asset.

---

### 6. Contacto y columna legal del footer

**Ubicación:** Footer, sección 12
**Estado:** En el primer draft el footer **no lleva** enlaces de `Aviso de privacidad` ni `Términos y condiciones` — se omiten por completo, no se dejan como `#` ni apuntando a páginas inexistentes. Tampoco lleva columna de Contacto.
**Qué falta:** Ver puntos 2 y 3. Cuando existan los documentos y los datos de contacto, se reponen las columnas del footer.
**Nota de implementación:** al quitar la columna Legal, el grid del footer pasa de 4 a 3 columnas. Reponer los enlaces implica volver al grid de 4.

---

### 7. Dominio de producción y preview para redes (Open Graph)

**Ubicación:** Metadata de `/`
**Estado:** Pendiente para la fase de pulido, no bloquea el primer draft.
**Qué falta:**
- **Dominio de producción.** Next.js necesita `metadataBase` para generar URLs absolutas de Open Graph y canonical. Hoy no existe ninguna variable de sitio en `.env.example`; habrá que añadir `NEXT_PUBLIC_SITE_URL`.
- **Imagen de Open Graph.** El doc de copy define título y descripción de OG pero **no imagen**. Sin ella, al compartir el link en WhatsApp, Facebook o LinkedIn no aparece preview visual. Hay que diseñar una (1200×630 px).

---

### 8. Plan de respaldo de la base de datos (MongoDB Atlas)

**Ubicación:** Infraestructura del backend — **fuera de este repo.** Se anota aquí porque es el doc de pendientes vivo del proyecto, pero la acción es del lado del backend/infra.
**Estado:** TODO para después del lanzamiento del primer draft. No bloquea la landing.

**Por qué importa:** los datos que guarda la plataforma no se pueden reconstruir si se pierden. Guías con folio `KFT-YYYYMM-NNNNNN` y su número de rastreo, saldo prepago en MXN y el historial de solicitudes de recarga, libreta de direcciones, y usuarios. Perder el saldo o el historial de guías es un problema contable y de confianza con el cliente, no solo un incidente técnico.

**Qué falta — en orden:**

1. **Verificar en qué tier está hoy el cluster.** Es el dato que decide todo lo demás, y hay que mirarlo en la consola de Atlas, no asumirlo. El punto crítico: **el tier gratuito (M0) no tiene respaldos.** Si el cluster de producción está en M0, hoy no hay ninguna red de seguridad.
2. **Confirmar qué ofrece cada tier en el momento de decidir.** Atlas ha reestructurado sus tiers y precios varias veces (los antiguos M2/M5 compartidos fueron sustituidos por el tier Flex), así que hay que confirmar contra la documentación y el pricing vigentes en lugar de fiarse de lo que se sabía antes. A grandes rasgos, lo que hay que comparar:
   - Si el tier tiene respaldos incluidos o no.
   - Si permite **restaurar a un punto en el tiempo** (PITR) o solo snapshots programados.
   - Cada cuánto se toma el snapshot y **cuánto tiempo se retiene**.
   - Si se puede **descargar** el respaldo o solo restaurar dentro de Atlas.
3. **Definir el objetivo antes de elegir el tier.** Dos preguntas de negocio: ¿cuántos datos podemos permitirnos perder (RPO — ¿una hora?, ¿un día?) y en cuánto tiempo hay que estar de vuelta (RTO)? Para saldo y guías el RPO tolerable probablemente sea de minutos, no de un día, y eso empuja hacia un tier dedicado con PITR.
4. **Considerar un respaldo propio además del de Atlas.** Un `mongodump` periódico a almacenamiento externo, fuera de la cuenta de Atlas. Protege contra los dos escenarios que el respaldo del propio proveedor no cubre: perder el acceso a la cuenta, y un borrado lógico hecho por la aplicación que se propaga al snapshot.
5. **Probar una restauración.** Un respaldo que nunca se ha restaurado no está confirmado. Hacer al menos una prueba de restauración a un cluster desechable y medir cuánto tardó.

**Nota:** ninguno de estos puntos toca `kraft-envios-fe`. Si el proyecto adopta un repo o doc de infraestructura, esta sección debería mudarse ahí.

---

## Resumen de blockers

| Punto | Crítico | Cuándo se resuelve |
| --- | --- | --- |
| Tiempo de aprobación | Bajo | Antes de publicar FAQ |
| Datos de contacto | Alto | Antes de publicar footer |
| Legal (privacidad/términos) | Alto | Antes de publicar (obligatorio) |
| Logos de paqueterías (sección 7) | Medio | Antes de publicar sección 7 |
| Logos dentro del screenshot del hero (4.1) | Medio | Antes de publicar |
| Precios/folio fijos en el hero (5) | Bajo | Antes de publicar |
| Dominio de producción + imagen OG (7) | Medio | Fase de pulido, antes de publicar |
| Respaldo de MongoDB Atlas (8) | Alto — pero no bloquea la landing | TODO posterior al primer draft. Infra/backend, no este repo |
