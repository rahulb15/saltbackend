// routes/header.routes.ts
import { Router } from 'express';
import headerController from '../controllers/header.controller';

const router: Router = Router();

router.get('/header-data', headerController.getHeaderData);

export default router;