import { AdminBalanceRequestStatusFilter, BalanceRequestStatus } from "@/shared/types/balance.types";

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
export const BALANCE_FIELD_DECISION = 'Fecha de resolución';
export const BALANCE_FIELD_PAYMENT_REFERENCE = 'Referencia de pago';
export const BALANCE_FIELD_DECISION_REASON = 'Razón de la cancelación';

// Neutral placeholder for a "Decisión" cell with no date on a non-pending request.
export const BALANCE_DECISION_NONE = '—';

// Placeholder shown for "Referencia de pago" while a request is still pending (comp).
export const BALANCE_PAYMENT_REFERENCE_PENDING_PLACEHOLDER = 'Por asignar';

// Placeholder shown for "Referencia de pago" on a cancelled or rejected request with no reference.
export const BALANCE_PAYMENT_REFERENCE_NOT_APPLICABLE = 'No aplica';

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

// Admin queue page copy (comps/admin-request-comp-desktop.png).
export const BALANCE_ADMIN_EYEBROW = 'Panel administrativo';
export const BALANCE_ADMIN_HEADING = 'Solicitudes de saldo';
export const BALANCE_ADMIN_SUBTITLE =
  'Revisa las solicitudes enviadas por usuarios y registra cada decisión desde un único flujo.';
export const BALANCE_ADMIN_SECTION_TITLE_PENDING = 'Pendientes por revisar';
export const BALANCE_ADMIN_SECTION_TITLE_ALL = 'Todas las solicitudes';

// Filter controls.
export const BALANCE_ADMIN_FILTER_STATUS_LABEL = 'Estado';
export const BALANCE_ADMIN_STATUS_FILTER_LABELS: Record<AdminBalanceRequestStatusFilter, string> = {
  pending: 'Pendientes',
  all: 'Todas',
};
export const BALANCE_ADMIN_APPLY_FILTERS = 'Aplicar filtros';

// Card / drawer field labels.
export const BALANCE_ADMIN_FIELD_REFERENCE = 'Referencia';
export const BALANCE_ADMIN_FIELD_ADMIN_IN_CHARGE = 'Admin a cargo';
export const BALANCE_ADMIN_FIELD_REQUEST_ID = 'ID de solicitud';
export const BALANCE_ADMIN_FIELD_USER = 'Usuario';
export const BALANCE_ADMIN_FIELD_UPDATED = 'Última actualización';
export const BALANCE_ADMIN_ADMIN_UNASSIGNED = 'Sin asignar';
export const BALANCE_ADMIN_VIEW_DETAIL = 'Ver detalle';

// Drawer.
export const BALANCE_ADMIN_DRAWER_TITLE = 'Detalle de solicitud';
export const BALANCE_ADMIN_DRAWER_CLOSE = 'Cerrar detalle';
export const BALANCE_ADMIN_DRAWER_INFO_TITLE = 'Información de la solicitud';

// Decision section (comps/admin-request-comp-confirm-approval|reject.png).
export const BALANCE_DECISION_SECTION_TITLE = 'Registrar decisión';
export const BALANCE_DECISION_APPROVE_ACTION = 'Aprobar solicitud';
export const BALANCE_DECISION_REJECT_ACTION = 'Rechazar solicitud';
export const BALANCE_DECISION_REFERENCE_LABEL = 'Referencia de pago';
export const BALANCE_DECISION_REFERENCE_PLACEHOLDER = 'Ej. KRF-843210';
export const BALANCE_DECISION_REASON_LABEL = 'Motivo (opcional)';
export const BALANCE_DECISION_REASON_PLACEHOLDER = 'Agrega contexto para el usuario';
export const BALANCE_DECISION_REASON_HELPER =
  'El usuario verá este motivo en su historial y en el correo de decisión.';
export const BALANCE_DECISION_DISMISS_ACTION = 'Cancelar';
export const BALANCE_DECISION_CONFIRM_APPROVE = 'Confirmar aprobación';
export const BALANCE_DECISION_CONFIRM_REJECT = 'Confirmar rechazo';
export const BALANCE_DECISION_CONFLICT_MESSAGE =
  'La solicitud ya cambió de estado y no se puede decidir. Actualiza la lista para ver el estado actual.';
export const BALANCE_DECISION_ERROR_MESSAGE =
  'No pudimos registrar la decisión. Inténtalo de nuevo.';

// Admin queue states.
export const BALANCE_ADMIN_LOADING_MESSAGE = 'Cargando solicitudes de saldo...';
export const BALANCE_ADMIN_EMPTY_PENDING = 'No hay solicitudes pendientes en este periodo.';
export const BALANCE_ADMIN_EMPTY_ALL = 'No hay solicitudes en este periodo.';
export const BALANCE_ADMIN_ERROR_TITLE = 'No pudimos cargar las solicitudes de saldo';
export const BALANCE_ADMIN_ERROR_BODY =
  'Ocurrió un problema al consultar la información. Revisa tu conexión e inténtalo de nuevo.';
export const BALANCE_ADMIN_ERROR_RETRY = 'Reintentar';

// Nav label (Aside + mobile drawer).
export const BALANCE_ADMIN_NAV_LABEL = 'Solicitudes de saldo';

// Admin request detail page copy (comps/story-5-email-deep-link-comp.png).
export const BALANCE_DETAIL_EYEBROW = 'Revisión administrativa';
export const BALANCE_DETAIL_SUBTITLE = 'Revisa la información antes de registrar una decisión.';
export const BALANCE_DETAIL_DECISION_SUBTITLE = 'Selecciona una acción para continuar.';
export const BALANCE_DETAIL_BACK_ACTION = 'Volver al panel';

// Promoted out of BalanceAdminRequestDrawer, which inlined this sentence.
export const BALANCE_DETAIL_READ_ONLY_MESSAGE =
  'Esta solicitud ya fue decidida y no admite más acciones.';

// Detail states.
export const BALANCE_DETAIL_LOADING_MESSAGE = 'Cargando solicitud de saldo...';
export const BALANCE_DETAIL_ERROR_TITLE = 'No pudimos cargar la solicitud';
export const BALANCE_DETAIL_ERROR_BODY =
  'Ocurrió un problema al consultar la información. Revisa tu conexión e inténtalo de nuevo.';
export const BALANCE_DETAIL_ERROR_RETRY = 'Reintentar';
export const BALANCE_DETAIL_NOT_FOUND_TITLE = 'Solicitud no encontrada';
export const BALANCE_DETAIL_NOT_FOUND_BODY =
  'La solicitud no existe o ya no está disponible. Revisa el enlace del correo o vuelve al panel principal.';

// Post-decision success panel (comps/story-5-email-deep-link-comp-decision-taken.png).
export const BALANCE_DETAIL_SUCCESS_TITLE = 'Decisión registrada';
export const BALANCE_DETAIL_SUCCESS_BODY =
  'La solicitud se actualizó correctamente y ya está disponible en la cola administrativa.';
export const BALANCE_DETAIL_SUCCESS_VIEW_ACTION = 'Ver solicitud actualizada';

// Unauthorized screen (comps/story-5-email-deep-link-comp-unauthorized.png + epic copy).
export const BALANCE_UNAUTHORIZED_TITLE = 'Acceso no autorizado';
export const BALANCE_UNAUTHORIZED_BODY =
  'No tienes acceso a esta solicitud. Esta página está disponible únicamente para administradores. Inicia sesión con una cuenta de administrador o vuelve al panel principal.';
