// routes/eventCategory.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { adminMiddleware } from '../../middlewares/admin.auth.middleware';
import eventCategoryController from '../controllers/eventCategory.controller';

const router: Router = Router();

// Multer configuration for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 images per request
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

// Public routes
router.get('/categories', eventCategoryController.getAll);
router.get('/categories/:slug', eventCategoryController.getBySlug);
router.get('/event-types/banquet-hall/:banquetHallId', eventCategoryController.getEventTypesByBanquetHall);
router.get('/event-types/search', eventCategoryController.searchEventTypes);

// Admin routes - Category management
router.post('/categories',
  adminMiddleware,
  upload.fields([{ name: 'banner', maxCount: 1 }]),
  eventCategoryController.create
);

router.put('/categories/:id',
  adminMiddleware,
  upload.fields([{ name: 'banner', maxCount: 1 }]),
  eventCategoryController.updateCategory
);

router.delete('/categories/:id',
  adminMiddleware,
  eventCategoryController.deleteCategory
);

// Admin routes - Event type management
router.post('/categories/:categoryId/event-types',
  adminMiddleware,
  upload.fields([{ name: 'images', maxCount: 10 }]),
  eventCategoryController.addEventType
);

router.put('/categories/:categoryId/event-types/:eventTypeId',
  adminMiddleware,
  upload.fields([{ name: 'images', maxCount: 10 }]),
  eventCategoryController.updateEventType
);

router.delete('/categories/:categoryId/event-types/:eventTypeId',
  adminMiddleware,
  eventCategoryController.deleteEventType
);

export default router;