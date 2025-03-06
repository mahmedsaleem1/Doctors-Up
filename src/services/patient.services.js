import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const hashPatientPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(String(password), salt);
};

const isPasswordValid = async (password, passwordFromModel) => {
    return await bcrypt.compare(password, passwordFromModel);
}

const generateAccessTokenPatient = (Patient) => {
    return jwt.sign({
        patient_id: Patient.patient_id, 
        email: Patient.email,
        full_name: Patient.full_name,
    },
        process.env.PATIENT_ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.PATIENT_ACCESS_TOKEN_EXPIRY }
    );
}

const generateRefreshTokenPatient = (Patient) => {
    return jwt.sign({
        patient_id: Patient.patient_id, // Yeh Sahi hai
        email: Patient.email,
        full_name: Patient.full_name,
    },
        process.env.PATIENT_REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.PATIENT_REFRESH_TOKEN_EXPIRY }
    )
}

export {
    hashPatientPassword,
    isPasswordValid,
    generateAccessTokenPatient,
    generateRefreshTokenPatient
}