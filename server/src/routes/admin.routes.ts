import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import * as spaceController from '../controllers/space.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(asyncHandler(authenticate), authorize('admin'));
router.get('/spaces', asyncHandler(spaceController.listAll));
router.post('/spaces', asyncHandler(spaceController.create));
router.put('/spaces/:spaceId', asyncHandler(spaceController.update));
router.delete('/spaces/:spaceId', asyncHandler(spaceController.remove));
router.get('/spaces/:spaceId/slots', asyncHandler(spaceController.slots));
router.get('/booking-requests', asyncHandler(bookingController.list));
router.patch('/booking-requests/:bookingId', asyncHandler(bookingController.review));

export default router;
