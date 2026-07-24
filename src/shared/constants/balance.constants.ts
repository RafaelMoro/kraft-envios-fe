import { BalanceRequestStatus } from "@/shared/types/balance.types";

export const BALANCE_STATUS_LABELS: Record<BalanceRequestStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
};

// Badge tone per status (comps: Pendiente amber, Aprobada green, Rechazada gray).
// Cancelada has no comp; use a neutral/red tone. Tests must NOT assert these classes.
export const BALANCE_STATUS_BADGE_COLOR: Record<BalanceRequestStatus, string> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'gray',
  cancelled: 'failure',
};

// Page-level copy (comps).
export const BALANCE_REQUESTS_EYEBROW = 'Saldo y movimientos';
export const BALANCE_REQUESTS_HEADING = 'Mis solicitudes';
export const BALANCE_REQUESTS_SUBTITLE =
  'Consulta el estado de tus solicitudes de saldo y cancela las que aún estén pendientes.';
export const BALANCE_REQUESTS_SECTION_TITLE = 'Solicitudes recientes';

// Card field labels (comps).
export const BALANCE_FIELD_AMOUNT = 'Monto solicitado';
export const BALANCE_FIELD_CREATED = 'Creada';
export const BALANCE_FIELD_DECISION = 'Decisión';
export const BALANCE_FIELD_PAYMENT_REFERENCE = 'Referencia de pago';
export const BALANCE_FIELD_DECISION_REASON = 'Razón de la cancelación';

// Neutral placeholder for a "Decisión" cell with no date on a non-pending request.
export const BALANCE_DECISION_NONE = '—';

// Empty state (comps/empty-state-comp-see-requests.png).
export const BALANCE_REQUESTS_EMPTY_TITLE = 'No tienes solicitudes todavía';
export const BALANCE_REQUESTS_EMPTY_BODY =
  'Cuando solicites saldo, podrás revisar aquí su avance y los datos de pago.';
export const BALANCE_REQUESTS_EMPTY_CTA = 'Crear solicitud';

// Error state (comps/error-comp-see-requests.png).
export const BALANCE_REQUESTS_ERROR_EYEBROW = 'Error de conexión';
export const BALANCE_REQUESTS_ERROR_TITLE = 'No pudimos cargar tus solicitudes de saldo';
export const BALANCE_REQUESTS_ERROR_BODY =
  'Ocurrió un problema al consultar la información. Revisa tu conexión e inténtalo de nuevo.';
export const BALANCE_REQUESTS_ERROR_RETRY = 'Reintentar';

// sr-only status text for the skeleton loading state.
export const BALANCE_REQUESTS_LOADING_MESSAGE = 'Cargando solicitudes...';

export const BALANCE_CANCEL_ACTION = 'Cancelar';
export const BALANCE_CANCEL_CONFIRM_TITLE = 'Cancelar solicitud de saldo';
export const BALANCE_CANCEL_CONFIRM_BODY =
  '¿Seguro que quieres cancelar esta solicitud de saldo? Esta acción no se puede deshacer.';
export const BALANCE_CANCEL_CONFIRM_ACTION = 'Sí, cancelar';
export const BALANCE_CANCEL_DISMISS_ACTION = 'No, volver';
export const BALANCE_CANCEL_ERROR_MESSAGE =
  'No pudimos cancelar la solicitud. Es posible que ya haya cambiado de estado. Actualiza e inténtalo de nuevo.';
