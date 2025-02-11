// routes/banquetHall.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { adminMiddleware } from '../../middlewares/admin.auth.middleware';
import banquetHallController from '../controllers/banquetHall.controller';

const router: Router = Router();

// Multer configuration
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
router.get('/', banquetHallController.getAll);

// Admin routes
router.post('/',
  adminMiddleware,
  upload.fields([{ name: 'images', maxCount: 10 }]),
  banquetHallController.create
);

router.put('/:id',
  adminMiddleware,
  upload.fields([{ name: 'images', maxCount: 10 }]),
  banquetHallController.update
);

router.delete('/:id',
  adminMiddleware,
  banquetHallController.delete
);

export default router;