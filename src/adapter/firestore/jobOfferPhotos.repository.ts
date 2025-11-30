// src/adapter/firestore/jobOfferPhotos.repository.ts
import { db } from '../../config/firebase.config';
import { deleteFileFromDrive } from '../../services/googleDrive.service';

const COLLECTION = 'ofertadetrabajo';

export const addJobOfferPhoto = async (
  userId: string,
  file: any
): Promise<string> => {
  const snapshot = await db
    .collection(COLLECTION)
    .doc(userId)
    .collection('photos')
    .get();

  if (snapshot.size >= 5) {
    throw new Error('Máximo 5 fotos permitidas por usuario');
  }

  // Guardar referencia en Firestore
  await db
    .collection(COLLECTION)
    .doc(userId)
    .collection('photos')
    .add({
      url: file.publicUrl,
      driveFileId: file.driveFileId,
      originalName: file.originalname,
      uploadedAt: new Date(),
    });

  return file.publicUrl;
};

export const getJobOfferPhotos = async (userId: string) => {
  const snapshot = await db
    .collection(COLLECTION)
    .doc(userId)
    .collection('photos')
    .orderBy('uploadedAt', 'desc')
    .get();

  return snapshot.docs.map((doc: any) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const deleteJobOfferPhoto = async (userId: string, photoId: string, driveFileId: string) => {
  // Eliminar de Google Drive
  try {
    await deleteFileFromDrive(driveFileId);
  } catch (error) {
    console.error('Error deleting from Drive:', error);
  }

  // Eliminar de Firestore
  await db.collection(COLLECTION).doc(userId).collection('photos').doc(photoId).delete();
};