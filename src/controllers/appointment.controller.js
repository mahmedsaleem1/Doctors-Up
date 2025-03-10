import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from '../utils/apiResponse.js';
import { transporter } from "../utils/nodeMailer.js";

const prisma = new PrismaClient();

export const bookAppointment = asyncHandler(async (req, res) => {
    const { appointment_date, appointment_time } = req.body;
    
    const doctor_id = req.params.doctor_id; // Doctor ID ab params se ayegi
    const patient_id = req.user.patient_id; // JWT se mila (authPatient middleware)
    
    // Validation (Doctor ID required hai)
    if (!doctor_id || !appointment_date || !appointment_time) {
        throw new ApiError(400, "Missing required fields");
    }

    // Doctor exist karta hai?
    const doctor = await prisma.doctors.findUnique({
        where: { doctor_id },
    });

    if (!doctor) {
        throw new ApiError(404, "Doctor not found");
    }

    const parsedDate = new Date(req.body.appointment_date);
    const parsedDateTime = new Date(`${req.body.appointment_date}T${req.body.appointment_time}:00.000Z`);

    // Check if appointment already exists for the same doctor, patient, date, and time
    const existingAppointment = await prisma.appointments.findFirst({
        where: {
            doctor_id,
            patient_id,
            appointment_date: parsedDate,
            appointment_time: parsedDateTime,
        },
    });

    if (existingAppointment) {
        throw new ApiError(400, "You already have an appointment with this doctor at the same time.");
    }


    // New appointment create
    const appointment = await prisma.appointments.create({
        data: {
            doctor_id,
            patient_id,
            appointment_date: parsedDate,
            appointment_time: parsedDateTime,
            status: "pending",
            payment_status: "unpaid",
        },
    });

    const patient = await prisma.patient.findUnique({
        where: { patient_id },
    });

    //send email to doctor email through transporter about the appointment
    const mailOptions = {
        from: process.env.EMAIL,
        to: doctor.email,
        subject: 'New Appointment',
        text: `You have a new appointment with ${patient.full_name} on ${req.body.appointment_date} at ${req.body.appointment_time}`
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            res.status(500).json(new ApiResponse(500, "Email not sent", error));
        }
    });

    res
    .status(201)
    .json(new ApiResponse(201, "Appointment booked successfully", appointment),);
});

export const doctorUpdateAppointment = asyncHandler(async (req, res) => {
    const { appointment_id } = req.params; // Appointment ID from URL
    const { status, payment_status } = req.body; // New values from request body
    const doctor_id = req.user.doctor_id; // Doctor's ID from JWT (authDoctor middleware)

    if (!status && !payment_status) {
        throw new ApiError(400, "All Fields are required");
    }

    // Find the appointment
    const appointment = await prisma.appointments.findUnique({
        where: { appointment_id },
    });

    if (!appointment) {
        throw new ApiError(404, "Appointment not found");
    }

    // Check if the logged-in doctor is the same as the appointment doctor
    if (appointment.doctor_id !== doctor_id) {
        throw new ApiError(403, "You are not authorized to update this appointment");
    }

    // Update appointment
    const updatedAppointment = await prisma.appointments.update({
        where: { appointment_id },
        data: {
            status: status || appointment.status,
            payment_status: payment_status || appointment.payment_status,
        },
    });

    res.status(200).json(new ApiResponse(200, "Appointment updated successfully", updatedAppointment));
});

export const getDoctorAppointments = asyncHandler(async (req, res) => {
    const doctor_id = req.user.doctor_id; // JWT se doctor ki ID lein

    const appointments = await prisma.appointments.findMany({
        where: { doctor_id },
        include: { Patient: false }, // Patient details bhi lein
    });

    res.status(200).json(new ApiResponse(200, "Doctor's appointments fetched", appointments));
});

export const getPatientAppointments = asyncHandler(async (req, res) => {
    const patient_id = req.user.patient_id; // JWT se patient ki ID lein

    const appointments = await prisma.appointments.findMany({
        where: { patient_id },
        include: { Doctors: false }, // Doctor details bhi lein
    });

    res.status(200).json(new ApiResponse(200, "Patient's appointments fetched", appointments));
});

export const cancelAppointment = asyncHandler(async (req, res) => {
    const { appointment_id } = req.params;
    const user_id = req.user.patient_id || req.user.doctor_id; // Patient or doctor
    
    const appointment = await prisma.appointments.findUnique({ where: { appointment_id } });

    if (!appointment) throw new ApiError(404, "Appointment not found");

    // Check if the request is from the related doctor or patient
    if (appointment.patient_id !== user_id && appointment.doctor_id !== user_id) {
        throw new ApiError(403, "Unauthorized to cancel this appointment");
    }

    await prisma.appointments.update({
        where: { appointment_id },
        data: { status: "cancelled" },
    });

    res.status(200).json(new ApiResponse(200, "Appointment cancelled successfully"));
});

