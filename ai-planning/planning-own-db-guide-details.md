# Plan: Own DB Guide Details View

## Goal

When the user is viewing `Ver mis guias` in `src/features/Dashboard/subscreens/Order.tsx` and clicks `Ver detalles` on a `GuideDbCard` (`src/features/Dashboard/subscreens/GuideDbCard.tsx:15`), replace the own-DB list with a guide details view matching the provided comp. Ignore the sidebar.

## Current State

- `src/features/Dashboard/subscreens/Order.tsx:203-311` renders the own-DB filters, list, and pagination.
- `src/features/Dashboard/subscreens/GuideDbCard.tsx:15` receives a `GuideDbRecord`.
- The `Ver detalles` button in `src/features/Dashboard/subscreens/GuideDbCard.tsx:76` has no click handler.
- `GuideDbRecord` (`src/shared/types/guides.types.ts:384-406`) already includes the required data: quote, addresses, parcel, status, failure info, IDs, label URL, and timestamps. No new backend call is needed.

## Implementation

### 1. New local state in `Order.tsx`

Add a `selectedDbGuide` state alongside the existing filters/pagination. Reset it on source change, month/year/limit/page change, and on `back`.

```ts
const [selectedDbGuide, setSelectedDbGuide] = useState<GuideDbRecord | null>(null)
```

### 2. Wire the button in `GuideDbCard.tsx`

Update the component signature to accept a click handler and pass it to the existing button. No new button, no new icon, no new wrapper.

```ts
export function GuideDbCard({
  guide,
  isMobile,
  onViewDetails,
}: {
  guide: GuideDbRecord
  isMobile: boolean
  onViewDetails: (guide: GuideDbRecord) => void
})
```

```tsx
<button
  type="button"
  className={clsx(primaryButtonCSS)}
  onClick={() => onViewDetails(guide)}
>
  Ver detalles
</button>
```

Add `data-testid="guide-db-details-button"` for tests.

### 3. Create `GuideDbDetails.tsx`

New file: `src/features/Dashboard/subscreens/GuideDbDetails.tsx`.

Props:

```ts
type GuideDbDetailsProps = {
  guide: GuideDbRecord
  onBack: () => void
}
```

Sections (each is a `rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800` card, matching `GuideDbCard.tsx:30`):

- **Top actions bar**: `Volver a guías` (outlined, `greySecondaryCSS`) on the left, `Copiar ID` (outlined, `secondaryButtonCSS`) on the right that copies `guide.kraftId` via `navigator.clipboard.writeText` (mirror `QuotesSubscreen.tsx:100`). Add `data-testid="guide-db-details-back-button"` and `data-testid="guide-db-details-copy-id-button"`.
- **Header card**: `kraftId` in a small mono pill; status pill (`created` green / `failed` red, reuse logic from `GuideDbCard.tsx:57-66`); provider pill; `Envío de {origin name} → {destination name}` as h1; meta line `Estafeta · Día siguiente · Creado el {formatDateToSpanish(new Date(guide.createdAt)).date}, {formatDateToSpanish(new Date(guide.createdAt)).time} hrs`; tracking/external IDs line; price on the right with `formatNumberToCurrency(guide.price ?? guide.quote.total)` (`src/shared/utils/global.utils.ts`).
- **Summary row (4 cards)**: Paquete, Servicio, Valor declarado, Actualizado. Build from `guide.parcel`, `guide.quote.service`, `guide.quote.typeService`, `guide.parcel.value`, `formatDateToSpanish(new Date(guide.updatedAt))`. Add `data-testid="guide-db-details-summary-card"`.
- **Ruta card**: header `RUTA` with right-aligned `Ver en mapa` link built from a Google Maps directions URL using `origin` and `destination` `street1, city, state`. Two side-by-side address blocks (mirroring `GuideDbCard.tsx:82-96`) with `ORIGEN` / `DESTINO` dots in primary blue / green.
- **Paquete card**: 3-col grid with CONTENIDO, CANTIDAD, PESO, DIMENSIONES (CM), VALOR DECLARADO, SAT PRODUCTO. Source from `guide.parcel` and `guide.parcel.satProductId`.
- **Cotización card**: SERVICIO, TIPO DE SERVICIO, COURIER, TOTAL, ID DE COTIZACIÓN. Source from `guide.quote`.
- **Error de creación card**: rendered only when `guide.status === 'failed' && guide.failureInfo`. Red-50 tinted card (mirror the failure block from `ResultGuideDbScreen.tsx:76-103`) with `errorDetails`, `errorCode` (e.g. `GDE-PVR-001`), and timestamp.

Reuse:

- `formatDateToSpanish` from `src/shared/utils/guides.utils.ts:298`.
- `formatNumberToCurrency` from `src/shared/utils/global.utils.ts`.
- `getGuideDbStatusLabel` from `src/shared/utils/guides.utils.ts`.
- `getQuoteImg` from `src/shared/utils/quotes.utils.ts` for the courier logo via the existing `CourierImage` atom (`src/shared/ui/atoms/CourierImage.tsx`).
- `primaryButtonCSS`, `secondaryButtonCSS`, `greySecondaryCSS` from `src/shared/constants/global.constants.ts`.

### 4. Render switch in `Order.tsx`

```tsx
{selectedSource === 'ownDb' && (
  selectedDbGuide
    ? <GuideDbDetails guide={selectedDbGuide} onBack={() => setSelectedDbGuide(null)} />
    : (
        <>
          {/* existing filters + list + pagination */}
        </>
      )
)}
```

Add the import:

```ts
import { GuideDbDetails } from '@/features/Dashboard/subscreens/GuideDbDetails'
```

Also import `GuideDbRecord` from `@/shared/types/guides.types` (already partially imported via `GetGuidesDbResponseData`).

### 5. Reset `selectedDbGuide` on filter/switch events

Inside the existing handlers:

```ts
const handleMonthChange = (month: number) => {
  setSelectedMonth(month)
  setDbPage(1)
  setSelectedDbGuide(null)
}
const handleYearChange = (year: number) => {
  setSelectedYear(year)
  setDbPage(1)
  setSelectedDbGuide(null)
}
const handleLimitChange = (limit: 10 | 50 | 100) => {
  setDbLimit(limit)
  setDbPage(1)
  setSelectedDbGuide(null)
}
```

And in the `Ver guias externas` / `Ver mis guias` `ButtonGroup`:

```tsx
onClick={() => { setSelectedSource('ownDb'); setDbPage(1); setSelectedDbGuide(null); }}
```

(plus the same reset on the external button to keep the pattern consistent; one-liner, low risk).

## Keep Out For Now

- No new backend request for guide details — pass the selected `GuideDbRecord` directly.
- No route change; details view is local state inside `Order`.
- No new global state, no new shared atom, no new `Context`.
- No `Reintentar guía` / `Imprimir` actions; comp shows them but they are not wired to anything real yet, so do not render until the action exists.
- No `Ver etiqueta` link when `guide.labelUrl` is null; render a disabled outline button only if a real URL is available. (Defer if YAGNI — the comp shows it, but there is no `Print` flow today; skip and revisit when those actions exist.)

## Tests

Update `__tests__/feature/Dashboard/Order.test.tsx` (existing `createMockDbRecord` factory at `:471` already covers the `GuideDbRecord` shape):

- Clicking `data-testid="guide-db-details-button"` on a card hides the list and shows the details view (assert `kraftId` and `Envío de … → …`).
- Details view shows the package card values from the mock.
- Failed guide shows the `Error de creación` block with `errorCode`.
- `data-testid="guide-db-details-back-button"` restores the list view.
- Clicking details does not call `getGuidesDbCb` again.

## Verification

```sh
pnpm test -- __tests__/feature/Dashboard/Order.test.tsx
pnpm exec tsc --noEmit
pnpm lint
```

Skip `pnpm design:lint` unless `DESIGN.md` is touched; this plan only uses existing tokens.

## File Touch List

- `src/features/Dashboard/subscreens/Order.tsx` (state + render switch + handler resets)
- `src/features/Dashboard/subscreens/GuideDbCard.tsx` (prop + onClick)
- `src/features/Dashboard/subscreens/GuideDbDetails.tsx` (new)
- `__tests__/feature/Dashboard/Order.test.tsx` (new cases)
