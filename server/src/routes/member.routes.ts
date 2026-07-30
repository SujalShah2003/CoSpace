import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import * as spaceController from '../controllers/space.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate, authorize('member', 'admin'));
router.get('/spaces', spaceController.listPublic);
router.get('/spaces/:spaceId/slots', spaceController.slots);
router.get('/bookings', bookingController.list);
router.post('/bookings', bookingController.book);
router.post('/booking-requests', bookingController.requestBooking);
router.patch('/bookings/:bookingId/cancel', bookingController.cancel);

export default router;
