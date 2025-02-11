// routes/featured-hotel.routes.ts

import { Router } from "express";
import { FeaturedHotelController } from "../controllers/featured-hotel.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";
import validateFeaturedHotel from "../../middlewares/featured-hotel.validation.middleware";
import multer from "multer";
import { Request, Response, NextFunction } from 'express';

const router = Router();
const controller = new FeaturedHotelController();

// Configure multer for memory storage
const storage = multer.memoryStorage();

// Configure file filter
const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    // Allow only images
    if (file.mimetype.startsWith('image/')) {
        // Validate file extension
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
        const fileExt = file.originalname.split('.').pop()?.toLowerCase();
        
        if (fileExt && allowedExtensions.includes(fileExt)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and WEBP files are allowed.'));
        }
    } else {
        cb(new Error('Only images are allowed'));
    }
};

// Configure multer upload
// const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: {
//         fileSize: 5 * 1024 * 1024, // 5MB limit
//         files: 10 // Maximum 10 files
//     }
// }).fields([
//     { name: 'customImages', maxCount: 10 }
// ]);

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 10 // Maximum 10 files
    }
}).any();


// Error handling middleware for multer
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({
            status: 'error',
            message: `Upload error: ${err.message}`
        });
    } else if (err) {
        return res.status(500).json({
            status: 'error',
            message: err.message || 'Unknown upload error occurred'
        });
    }
    next();
};

// Wrap multer upload with error handling
// const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
//     upload(req, res, (err) => {
//         if (err) {
//             return handleMulterError(err, req, res, next);
//         }
//         next();
//     });
// };


const uploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
    upload(req, res, (err) => {
        if (err) {
            return handleMulterError(err, req, res, next);
        }

        // Validate file fields after upload
        if (req.files) {
            const files = req.files as Express.Multer.File[];
            const invalidFiles = files.filter(file => 
                !file.fieldname.startsWith('customImages') &&
                file.fieldname !== 'customImages'
            );

            if (invalidFiles.length > 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid file field names detected'
                });
            }
        }

        next();
    });
};

// Public routes
router.get("/", controller.getFeaturedHotels);
router.get("/:id", controller.getById);

// Admin routes
// Add new featured hotel
router.post("/",
    adminMiddleware,
    uploadMiddleware,
    // validateFeaturedHotel,
    controller.addFeaturedHotel
);

// Update featured hotel images
router.patch("/:id/images",
    adminMiddleware,
    uploadMiddleware,
    controller.updateImages
);

// Update featured hotel details
router.patch("/:id/details",
    adminMiddleware,
    validateFeaturedHotel,
    controller.updateDetails
);

// Delete featured hotel
router.delete("/:id",
    adminMiddleware,
    controller.delete
);

export default router;