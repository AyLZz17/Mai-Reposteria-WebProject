const USERS_SERVICE_URL = (process.env.USERS_SERVICE_URL || 'http://users-service:8081').replace(/\/$/, '');

async function recordReviewAdminAction({ accessToken, requestId, reviewId, productId, action, summary }) {
  const response = await fetch(`${USERS_SERVICE_URL}/api/v1/internal/audit`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
      ...(requestId ? { 'x-request-id': requestId } : {}),
    },
    body: JSON.stringify({
      action,
      entityType: 'PRODUCT_REVIEW',
      entityId: String(reviewId),
      outcome: 'SUCCESS',
      summary,
      requestId,
    }),
    signal: AbortSignal.timeout(2500),
  });
  if (!response.ok) throw new Error(`Admin audit returned HTTP ${response.status}`);
}

module.exports = { recordReviewAdminAction };
