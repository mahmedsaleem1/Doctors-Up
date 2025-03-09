import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const hashDoctorPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const isPasswordValid = async (password, passwordFromModel) => {
    return await bcrypt.compare(password, passwordFromModel);
}

const generateAccessTokenDoctor = (doctor) => {
    return jwt.sign({
        doctor_id: doctor.doctor_id, // Yeh line sahi hai
        email: doctor.email,
        full_name: doctor.full_name,
    },
        process.env.DOCTOR_ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.DOCTOR_ACCESS_TOKEN_EXPIRY }
    );
}

const generateRefreshTokenDoctor = (doctor) => {
    return jwt.sign({
        doctor_id: doctor.doctor_id, // Yeh Sahi hai
        email: doctor.email,
        full_name: doctor.full_name,
    },
        process.env.DOCTOR_REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.DOCTOR_REFRESH_TOKEN_EXPIRY }
    )
}

export {
    hashDoctorPassword,
    isPasswordValid,
    generateAccessTokenDoctor,
    generateRefreshTokenDoctor
}