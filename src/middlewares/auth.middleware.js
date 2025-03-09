import jwt from 'jsonwebtoken';
import {asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';

export const authDoctor = asyncHandler(async (req, res, next) => {
    const token = req.cookies.accessToken; // Cookie se token le rahay ho na?

    if (!token) {
        return res.status(401).json({ message: "Unauthorized - No Token" });
    }

    const decoded = jwt.verify(token, process.env.DOCTOR_ACCESS_TOKEN_SECRET);

    req.user = decoded; // Yeh object JWT se aya
    
    next();
});

export const authPatient = asyncHandler(async (req, res, next) => {
    const token = req.cookies.accessToken;
    
    if (!token) {
        return res.status(401).json({ message: "Unauthorized - No Token" });
    }

    const decoded = jwt.verify(token, process.env.PATIENT_ACCESS_TOKEN_SECRET);
    
    req.user = decoded; // Yeh object JWT se aya
    next();
});

export const authDoctorOrPatient = asyncHandler((req, res, next) => {
    const token = req.cookies.accessToken; // Taking token from cookies

    if (!token) {
        return res.status(401)
                .json(new ApiError(401, "Unauthorized - No Token"));
    }

    try {
        // First, try decoding with Doctor's secret
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.DOCTOR_ACCESS_TOKEN_SECRET);
        } catch (err) {
            // If Doctor's secret fails, try Patient's secret
            try {
                decoded = jwt.verify(token, process.env.PATIENT_ACCESS_TOKEN_SECRET);
            } catch (err) {
                return res.status(401)
                .json(new ApiError(401, "Unauthorized - No Token"));
            }
        }

        req.user = decoded; // Attach decoded user to req.user

        // Check if the token belongs to a doctor or patient
        if (!req.user || (!req.user.patient_id && !req.user.doctor_id)) {
            return res.status(401)
                .json(new ApiError(401, "Unauthorized - only Doctor or Patient allowed"));
        }

        next();
    } catch (error) {
        return res.status(401)
                .json(new ApiError(401, "Unauthorized - No Token"));
    }
});
