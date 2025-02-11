import multer from "multer";
import { Request, Response, NextFunction } from 'express';

const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Log incoming file for debugging
  console.log('Incoming file:', file);
  
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
    files: 10 // Maximum 10 files
  }
}).fields([
  { name: 'hotelImages', maxCount: 5 } // Specifically handle 'hotelImages' field
]);

// Export a middleware function that includes error handling
export const upload = (req: Request, res: Response, next: NextFunction) => {
  uploadConfig(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      console.error('Multer error:', err);
      return res.status(400).json({
        status: 'error',
        message: `Upload error: ${err.message}`
      });
    } else if (err) {
      // An unknown error occurred
      console.error('Unknown upload error:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Unknown upload error occurred'
      });
    }
    
    // Log the files after successful upload
    console.log('Files after upload:', req.files);
    
    // Everything went fine
    next();
  });
};