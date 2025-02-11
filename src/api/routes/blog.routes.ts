import { Router } from "express";
import multer from "multer";
import { adminMiddleware } from "../../middlewares/admin.auth.middleware";
import blogController from "../controllers/blog.controller";

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes: string[] = ["image/jpeg", "image/png", "image/gif"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, and GIF files are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB file size limit
  },
});

const router: Router = Router();

// Existing routes
router.get("/getBlogList", adminMiddleware, blogController.getBlogList);
router.get("/recent-posts", blogController.getRecentPosts);
router.get("/getAll/:source", blogController.getAll);
router.get("/:slug", blogController.getBySlug);
router.get('/getblog/:id', blogController.getRedirect.bind(blogController));

router.post("/", adminMiddleware, (req, res, next) => {
  upload.fields([{ name: "thumbnail", maxCount: 1 }])(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: 'An unknown error occurred during file upload.' });
    }
    next();
  });
}, blogController.create);

router.put("/:id", adminMiddleware, (req, res, next) => {
  upload.fields([{ name: "thumbnail", maxCount: 1 }])(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: 'An unknown error occurred during file upload.' });
    }
    next();
  });
}, blogController.updateById);

router.delete("/:id", adminMiddleware, blogController.deleteById);


export default router;
