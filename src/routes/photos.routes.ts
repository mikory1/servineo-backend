// src/api/routes/photos.routes.ts
import { Router } from 'express';
import {
  updateProfilePhoto,
  getMyProfilePhoto,
  uploadJobOfferPhoto,
  uploadMultipleJobOfferPhotos,
  getMyJobOfferPhotos,
  removeJobOfferPhoto,
} from '../controllers/photos.controller';

const router = Router();

// Foto de perfil
router.post('/profile-photo', updateProfilePhoto);
router.get('/profile-photo', getMyProfilePhoto);

// Fotos de oferta de trabajo
router.post('/job-offer-photos', uploadJobOfferPhoto);
router.post('/job-offer-photos/bulk', uploadMultipleJobOfferPhotos); // Nuevo endpoint
router.get('/job-offer-photos', getMyJobOfferPhotos);
router.delete('/job-offer-photos', removeJobOfferPhoto);

export default router;