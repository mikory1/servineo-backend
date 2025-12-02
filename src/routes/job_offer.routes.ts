// ruta official para offertas de trabajo

import { Router } from 'express';
import * as jobOfferController from '../controllers/job_offer.controller';
import { upload } from '../config/multer.config';



const jobOfficial = Router();

/**
 * @route   POST /api/job-offers
 * @desc    Crear nueva oferta de trabajo
 * @access  Private (requiere autenticación)
 */
jobOfficial.post(
    '/',
    // authenticate, // Descomenta si tienes middleware de autenticación
    upload.array('photos', 5),
    jobOfferController.createJobOffer
);

/**
 * @route   GET /api/job-offers
 * @desc    Obtener todas las ofertas con filtros y paginación
 * @access  Public
 */
jobOfficial.get('/', jobOfferController.getAllJobOffers);

/**
 * @route   GET /api/job-offers/fixer/:fixerId
 * @desc    Obtener ofertas de un fixer específico
 * @access  Public
 */
jobOfficial.get('/fixer/:fixerId', jobOfferController.getJobOffersByFixerId);

/**
 * @route   GET /api/job-offers/:id
 * @desc    Obtener una oferta por ID
 * @access  Public
 */
jobOfficial.get('/:id', jobOfferController.getJobOfferById);

/**
 * @route   PUT /api/job-offers/:id
 * @desc    Actualizar una oferta
 * @access  Private (debe ser el dueño)
 */
jobOfficial.put(
    '/:id',
    // authenticate, // Descomenta si tienes middleware de autenticación
    upload.array('photos', 5),
    jobOfferController.updateJobOffer
);

/**
 * @route   DELETE /api/job-offers/:id
 * @desc    Eliminar una oferta
 * @access  Private (debe ser el dueño)
 */
jobOfficial.delete(
    '/:id',
    // authenticate, // Descomenta si tienes middleware de autenticación
    jobOfferController.deleteJobOffer
);

export default jobOfficial;