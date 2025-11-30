// src/api/controllers/photos.controller.ts  (nuevo archivo recomendado)
import { Request, Response } from 'express';
import {
  setProfilePhotoUrl,
  getProfilePhotoUrl,
} from '../adapter/firestore/profilePhoto.repository';
import {
  addJobOfferPhoto,
  getJobOfferPhotos,
  deleteJobOfferPhoto,
} from '../adapter/firestore/jobOfferPhotos.repository';
import { uploadFileToDrive, getDirectImageUrl } from '../services/googleDrive.service';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req: any, file: any, cb: any) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, png, webp)'));
    }
  },
});

// === FOTO DE PERFIL (sube a Drive y guarda URL) ===
export const updateProfilePhoto = [
  upload.single('photo'),
  async (req: Request, res: Response) => {
    try {
      const userId = req.body.userId || req.query.userId;
      
      if (!userId) {
        return res.status(400).json({ error: 'userId es requerido' });
      }

      if (!(req as any).file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
      }

      const file = (req as any).file;
      const timestamp = Date.now();
      const fileName = `profile_${userId}_${timestamp}_${file.originalname}`;
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

      // Subir a Google Drive
      const result = await uploadFileToDrive(
        file.buffer,
        fileName,
        file.mimetype,
        folderId
      );

      // Guardar URL en Firestore
      await setProfilePhotoUrl(userId, result.directLink);

      res.json({ 
        success: true, 
        message: 'Foto de perfil actualizada', 
        photoUrl: result.directLink,
        fileId: result.fileId
      });
    } catch (error: any) {
      console.error('Error updating profile photo:', error);
      res.status(500).json({ error: error.message });
    }
  },
];

export const getMyProfilePhoto = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId es requerido' });
    }

    const photoUrl = await getProfilePhotoUrl(userId);
    res.json({ photoUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// === FOTOS DE OFERTA DE TRABAJO (hasta 5) ===
export const uploadJobOfferPhoto = [
  upload.single('photo'),
  async (req: Request, res: Response) => {
    try {
      if (!(req as any).file) {
        return res.status(400).json({ error: 'No se subió ningún archivo' });
      }

      const userId = (req.body.userId || req.query.userId) as string;

      if (!userId) {
        return res.status(400).json({ error: 'userId es requerido' });
      }

      const file = (req as any).file;
      const timestamp = Date.now();
      const fileName = `joboffer_${userId}_${timestamp}_${file.originalname}`;
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

      // Subir a Google Drive
      const result = await uploadFileToDrive(
        file.buffer,
        fileName,
        file.mimetype,
        folderId
      );

      // Guardar referencia en Firestore
      const photoUrl = await addJobOfferPhoto(userId, {
        ...file,
        driveFileId: result.fileId,
        publicUrl: result.directLink,
      });

      res.json({ 
        success: true, 
        photoUrl: result.directLink,
        fileId: result.fileId
      });
    } catch (error: any) {
      if (error.message.includes('Máximo 5')) {
        return res.status(400).json({ error: error.message });
      }
      console.error('Error uploading job offer photo:', error);
      res.status(500).json({ error: error.message });
    }
  },
];

export const getMyJobOfferPhotos = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'userId es requerido' });
    }

    const photos = await getJobOfferPhotos(userId);
    res.json({ photos });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const removeJobOfferPhoto = async (req: Request, res: Response) => {
  try {
    const { userId, photoId, fileName } = req.body;

    if (!userId || !photoId || !fileName) {
      return res.status(400).json({ error: 'userId, photoId y fileName son requeridos' });
    }

    await deleteJobOfferPhoto(userId, photoId, fileName);
    res.json({ success: true, message: 'Foto eliminada' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// === SUBIDA MÚLTIPLE DE FOTOS (para ofertas de trabajo) ===
export const uploadMultipleJobOfferPhotos = [
  upload.array('files', 5),
  async (req: Request, res: Response) => {
    try {
      const files = (req as any).files;
      
      if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No se subieron archivos' });
      }

      const userId = req.body.userId || req.query.userId;
      if (!userId) {
        return res.status(400).json({ error: 'userId es requerido' });
      }

      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const timestamp = Date.now();
        const fileName = `joboffer_${userId}_${timestamp}_${file.originalname}`;

        const result = await uploadFileToDrive(
          file.buffer,
          fileName,
          file.mimetype,
          folderId
        );

        uploadedUrls.push(result.directLink);
      }

      res.json({
        success: true,
        urls: uploadedUrls,
        message: `${uploadedUrls.length} archivo(s) subido(s) exitosamente`,
      });
    } catch (error: any) {
      console.error('Error uploading multiple photos:', error);
      res.status(500).json({ error: error.message });
    }
  },
];