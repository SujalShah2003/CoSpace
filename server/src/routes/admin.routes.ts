import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import * as spaceController from '../controllers/space.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.use(authenticate, authorize('admin'));
router.get('/spaces', spaceController.listAll);
router.post('/spaces', spaceController.create);
router.put('/spaces/:spaceId', spaceController.update);
router.delete('/spaces/:spaceId', spaceController.remove);
router.get('/spaces/:spaceId/slots', spaceController.slots);
router.get('/booking-requests', bookingController.list);
router.patch('/booking-requests/:bookingId', bookingController.review);

export default router;
