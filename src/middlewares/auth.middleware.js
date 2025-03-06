import jwt from 'jsonwebtoken';
import {ApiError} from '../utils/apiError.js';
import {asyncHandler} from '../utils/asyncHandler.js';

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
    const token = req.cookies.accessToken; // Cookie se token le rahay ho na?

    if (!token) {
        return res.status(401).json({ message: "Unauthorized - No Token" });
    }

    const decoded = jwt.verify(token, process.env.PATIENT_ACCESS_TOKEN_SECRET);

    req.user = decoded; // Yeh object JWT se aya
    next();
});