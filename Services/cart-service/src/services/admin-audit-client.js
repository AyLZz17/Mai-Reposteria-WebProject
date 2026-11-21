const USERS_SERVICE_URL = (process.env.USERS_SERVICE_URL || 'http://users-service:8081').replace(/\/$/, '');

async function recordOrderAdminChange({ accessToken, requestId, ticket, action, summary }) {
  const response = await fetch(`${USERS_SERVICE_URL}/api/v1/internal/audit`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
      ...(requestId ? { 'x-request-id': requestId } : {}),
    },
    body: JSON.stringify({
      action,
      entityType: 'ORDER',
      entityId: ticket,
      outcome: 'SUCCESS',
      summary,
      requestId,
    }),
    signal: AbortSignal.timeout(2500),
  });
  if (!response.ok) throw new Error(`Admin audit returned HTTP ${response.status}`);
}

function recordOrderConfirmation({ accessToken, requestId, ticket }) {
  return recordOrderAdminChange({ accessToken, requestId, ticket, action: 'CONFIRM_ORDER', summary: `Confirmo el pedido ${ticket} desde el panel de administracion.` });
}

function recordOrderTrackingUpdate({ accessToken, requestId, ticket, status, estimatedDeliveryDate }) {
  return recordOrderAdminChange({ accessToken, requestId, ticket, action: 'UPDATE_ORDER_TRACKING', summary: `Actualizo el seguimiento del pedido ${ticket}: estado ${status}, entrega estimada ${estimatedDeliveryDate || 'sin fecha'}.` });
}

module.exports = { recordOrderConfirmation, recordOrderTrackingUpdate };
