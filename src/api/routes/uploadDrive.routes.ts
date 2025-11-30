import { Router } from 'express';
import { uploadMultipleImages } from '../controllers/uploadDrive.controller';

const router = Router();

router.post('/bulk-upload', uploadMultipleImages);

export default router;
