import { Request, Response } from 'express';
import { uploadFileToDrive } from '../../services/googleDrive.service';
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

export const uploadMultipleImages = [
  upload.array('files', 5),
  async (req: Request, res: Response) => {
    try {
      console.log('📤 Iniciando upload múltiple...');
      
      const files = (req as any).files;
      console.log('📁 Archivos recibidos:', files?.length || 0);
      
      if (!files || files.length === 0) {
        console.log('❌ No se recibieron archivos');
        return res.status(400).json({ error: 'No se subieron archivos' });
      }

      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
      console.log('📂 Folder ID:', folderId ? '✅' : '❌');
      console.log('🔑 Google credentials check:', {
        projectId: !!process.env.GOOGLE_PROJECT_ID,
        clientEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
        privateKey: !!process.env.GOOGLE_PRIVATE_KEY,
      });

      const uploadedUrls: string[] = [];

      for (const file of files) {
        const timestamp = Date.now();
        const fileName = `servineo_${timestamp}_${file.originalname}`;
        
        console.log(`⬆️  Subiendo: ${fileName} (${file.size} bytes)`);

        const result = await uploadFileToDrive(
          file.buffer,
          fileName,
          file.mimetype,
          folderId
        );

        console.log(`✅ Subido: ${result.fileId}`);
        uploadedUrls.push(result.directLink);
      }

      console.log('🎉 Upload completado. Total URLs:', uploadedUrls.length);

      res.json({
        success: true,
        urls: uploadedUrls,
        message: `${uploadedUrls.length} archivo(s) subido(s) exitosamente`,
      });
    } catch (error: any) {
      console.error('💥 Error en uploadMultipleImages:', error);
      console.error('Stack trace:', error.stack);
      
      res.status(500).json({ 
        error: error.message || 'Error al subir archivos',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },
];
