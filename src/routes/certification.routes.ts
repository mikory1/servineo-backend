// ruta oficial para certificaciones
import { Router } from 'express';
import * as certificationController from '../controllers/certification.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Certification
 *   description: Gestión de certificaciones
 */

/**
 * @swagger
 * /certifications:
 *   post:
 *     summary: Agregar certificación
 *     tags: [Certification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - institution
 *               - issueDate
 *             properties:
 *               name:
 *                 type: string
 *               institution:
 *                 type: string
 *               issueDate:
 *                 type: string
 *                 format: date
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               credentialId:
 *                 type: string
 *               credentialUrl:
 *                 type: string
 *                 description: URL pública de la credencial (subida por el cliente)
 *     responses:
 *       201:
 *         description: Certificación creada
 */
router.post('/', certificationController.createCertification);

/**
 * @swagger
 * /certifications/fixer/{fixerId}:
 *   get:
 *     summary: Obtener certificaciones de un fixer
 *     tags: [Certification]
 *     parameters:
 *       - in: path
 *         name: fixerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de certificaciones
 */
router.get('/fixer/:fixerId', certificationController.getCertificationsByFixerId);

/**
 * @swagger
 * /certifications/{id}:
 *   get:
 *     summary: Obtener certificación por id
 *     tags: [Certification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificación encontrada
 */
router.get('/:id', certificationController.getCertificationById);

/**
 * @swagger
 * /certifications/{id}:
 *   put:
 *     summary: Actualizar certificación
 *     tags: [Certification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               institution:
 *                 type: string
 *               issueDate:
 *                 type: string
 *                 format: date
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               credentialId:
 *                 type: string
 *               credentialUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Certificación actualizada
 */
router.put('/:id', certificationController.updateCertification);

/**
 * @swagger
 * /certifications/{id}:
 *   delete:
 *     summary: Eliminar certificación
 *     tags: [Certification]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificación eliminada
 */
router.delete('/:id', certificationController.deleteCertification);

export default router;
