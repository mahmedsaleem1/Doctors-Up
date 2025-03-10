import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from '../utils/apiResponse.js';

const prisma = new PrismaClient();

export const createReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const { appointment_id } = req.params;
    const patient_id = req.user.patient_id;

    const appointment = await prisma.appointments.findUnique({
        where: {
            appointment_id: appointment_id
        }
    });

    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    if (appointment.patient_id !== patient_id) {
        throw new ApiError(403, 'You are not authorized to review this appointment');
    }

    if (appointment.status !== 'completed') {
        throw new ApiError(400, 'You cannot review an appointment that has not been completed');
    }

    if (appointment.status === 'cancelled' || appointment.status === 'pending') {
        throw new ApiError(400, 'You cannot review an appointment that has been cancelled or pending');
    }

    const review = await prisma.reviews.create({
        data: {
            rating,
            comment,
            appointment_id
        }
    });

    return new ApiResponse(res, 201, review);
});

export const getReviewsOfDoctor = asyncHandler(async (req, res) => {
    const { doctor_id } = req.params;

    const reviews = await prisma.reviews.findMany({
        where: {
            Appointment: {
                doctor_id
            }
        }
    });
    
    if (!reviews) {
        throw new ApiError(404, 'No reviews found for this doctor');
    }

    return res.status(200)
    .json(new ApiResponse(200, reviews,"Reviews Feteched Successfully"));
});

export const getReviewsOfPatient = asyncHandler(async (req, res) => {
    const { patient_id } = req.params;

    const reviews = await prisma.reviews.findMany({
        where: {
            Appointment: {
                patient_id
            }
        }
    });
    
    if (!reviews) {
        throw new ApiError(404, 'No reviews given by this patient');
    }

    return res.status(200)
    .json(new ApiResponse(200, reviews,"Reviews Feteched Successfully"));
});