const express = require('express');
const rateLimit = require('express-rate-limit');
const reviewService = require('../services/review.service');
const { recordReviewAdminAction } = require('../services/review-audit-client');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const logger = require('../logger');

const router = express.Router();
const submissionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user?.userId || 'unknown-user',
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Alcanzaste el limite de reseñas por ahora. Intentalo de nuevo mas tarde.' },
});

router.get('/summary', async (req, res, next) => {
  try { res.json(await reviewService.getPublicSummaries()); }
  catch (error) { next(error); }
});

router.get('/products/:productId', async (req, res, next) => {
  try {
    if (!reviewService.PRODUCT_ID_PATTERN.test(req.params.productId)) return res.status(404).json({ error: 'Producto no encontrado.' });
    const reviews = await reviewService.getPublicReviews(req.params.productId);
    if (reviews === null) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json(reviews);
  } catch (error) { next(error); }
});

router.post('/products/:productId', requireAuth, submissionLimiter, async (req, res, next) => {
  try {
    const review = await reviewService.submitReview({
      productId: req.params.productId,
      userId: req.user.userId,
      rating: req.body?.rating,
      title: req.body?.title,
      comment: req.body?.comment,
    });
    res.status(201).json(review);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    next(error);
  }
});

router.get('/admin', requireAuth, requireAdmin, async (req, res, next) => {
  try { res.json(await reviewService.getAdminReviews({ status: req.query.status || 'PENDING', limit: req.query.limit, offset: req.query.offset })); }
  catch (error) { if (error.status) return res.status(error.status).json({ error: error.message }); next(error); }
});

router.patch('/admin/:reviewId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const review = await reviewService.moderateReview({ reviewId: req.params.reviewId, status: req.body?.status, adminUserId: req.user.userId });
    if (!review) return res.status(404).json({ error: 'No encontramos esa reseña.' });
    try {
      const token = (req.get('authorization') || '').split(' ')[1];
      await recordReviewAdminAction({
        accessToken: token, requestId: req.requestId, reviewId: review.id, productId: review.productId,
        action: 'MODERATE_PRODUCT_REVIEW', summary: `Moderacion de resena del producto ${review.productId}: ${review.status}.`,
      });
    } catch (auditError) { logger.warning('review_moderation_audit_failed', { requestId: req.requestId, reviewId: req.params.reviewId, error: auditError.message }); }
    res.json(review);
  } catch (error) { if (error.status) return res.status(error.status).json({ error: error.message }); next(error); }
});

module.exports = router;
