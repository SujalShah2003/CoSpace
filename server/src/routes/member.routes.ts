import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import * as spaceController from '../controllers/space.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.use(asyncHandler(authenticate), authorize('member', 'admin'));
router.get('/spaces', asyncHandler(spaceController.listPublic));
router.get('/spaces/:spaceId/slots', asyncHandler(spaceController.slots));
router.get('/bookings', asyncHandler(bookingController.list));
router.post('/bookings', asyncHandler(bookingController.book));
router.post('/booking-requests', asyncHandler(bookingController.requestBooking));
router.patch('/bookings/:bookingId/cancel', asyncHandler(bookingController.cancel));

export default router;
