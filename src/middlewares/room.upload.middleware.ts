// middlewares/room.upload.middleware.ts
import multer from "multer";
import { Request, Response, NextFunction } from 'express';

const storage = multer.memoryStorage();

const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    console.log('Incoming room file:', file);
    
    const allowedMimes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only JPEG, PNG, and GIF files are allowed."));
    }
};

const uploadConfig = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 11 // Maximum 11 files (1 main + 10 additional)
    }
}).fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 10 }
]);

export const roomUpload = (req: Request, res: Response, next: NextFunction) => {
    uploadConfig(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.error('Multer error in room upload:', err);
            return res.status(400).json({
                status: 'error',
                message: `Upload error: ${err.message}`
            });
        } else if (err) {
            console.error('Unknown room upload error:', err);
            return res.status(500).json({
                status: 'error',
                message: 'Unknown upload error occurred'
            });
        }
        
        console.log('Room files after upload:', req.files);
        next();
    });
};
