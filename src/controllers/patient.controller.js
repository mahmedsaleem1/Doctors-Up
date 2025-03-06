import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse} from '../utils/apiResponse.js';
import { prisma } from '../config/prismaDb.js';
import { hashPatientPassword,
        isPasswordValid,
        generateAccessTokenPatient,
        generateRefreshTokenPatient } from '../services/patient.services.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { transporter } from '../utils/nodeMailer.js';

export const generateAccessAndRefreshToken = async (patient) => {
    try {
        const genAccessToken = generateAccessTokenPatient(patient);
        const genRefreshToken = generateRefreshTokenPatient(patient);
                
        await prisma.patient.update({
            where: { patient_id: patient.patient_id }, 
            data: {
                accessToken: genAccessToken,
                refreshToken: genRefreshToken
            }
        });

        return { genAccessToken, genRefreshToken };
    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Unable to generate Tokens at the moment");
    }
};

export const registerPatient = asyncHandler(async (req, res) => {
    const { fullname, age, gender, contact, email, password } = req.body;

    if (!fullname || !age || !gender || !contact 
        || !email || !password) {
            throw new ApiError(400, "All Fields are Required")
    }
       
    const existedPatient = await prisma.patient.findUnique({
        where: {
            email
        }
    });

    if (existedPatient) {
        throw new ApiError(400, "Patient Already Exists")
    }

    let profilePicLocalPath;

    if (!req.files.profile_picture) {
        throw new ApiError(400, "Profile Picture is Required")
        }
    
    profilePicLocalPath = req.files.profile_picture[0].path;

    const profilePicCloudinary = await uploadOnCloudinary(profilePicLocalPath);

    if(!profilePicCloudinary) {
        throw new ApiError(500, "Profile Picture Upload Failed")
    }

    const createdPatient = await prisma.patient.create({
        data: {
            full_name: fullname, 
            age : parseInt(age),
            gender,
            contact_number: contact, 
            email,
            password: await hashPatientPassword(password),
            profile_picture: profilePicCloudinary.url,
        }
    });

    if (!createdPatient) {
        throw new ApiError(500, "Pateint Registration Failed")
    }

    return res.status(201).json(new ApiResponse(201, "Patient Registered Successfully"));
});

export const loginPatient = asyncHandler(async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and Password are Required")
    }

    const patientTobeLoggedIn = await prisma.patient.findUnique({
        where: {
            email
        }
    });

    if (!patientTobeLoggedIn) {
        throw new ApiError(404, "Patient Not Found")
    }
    
    const isPasswordMatched = await isPasswordValid(password.toString(), patientTobeLoggedIn.password);

    if (!isPasswordMatched) {
        throw new ApiError(401, "Invalid Credentials")
    }

    const { genAccessToken, genRefreshToken } = await generateAccessAndRefreshToken(patientTobeLoggedIn);
    
    const patientToBeSent = await prisma.patient.findUnique({
        where: { email },
        select: {
            password: false,       // Hide password
            refreshToken: false,   // Hide refreshToken
            accessToken: false,    // Hide accessToken
            patient_id: true,
            full_name: true,
            email: true,
            profile_picture: true,
            contact_number: true,
            age : true,
            gender: true
        }
    });
    
    const options = {
        httpsOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie('accessToken', genAccessToken, options)
        .cookie('refreshToken', genRefreshToken, options)
        .json(new ApiResponse(200, patientToBeSent,"Patient Logged In Successfully"));
});

export const logoutPatient = asyncHandler(async (req, res) => {
    if (!req.user.patient_id) {
        return res.status(401).json({ message: "Invalid Token" });
    }

    await prisma.patient.update({
        where: { patient_id: req.user.patient_id },
        data: { refreshToken: null }
    });

    res.clearCookie("accessToken", { httpOnly: true });
    res.clearCookie("refreshToken", { httpOnly: true });
    res.status(200).json({ message: "Patient Logged Out Successfully" });
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized Request");
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.PATIENT_REFRESH_TOKEN_SECRET);

        if (!decodedToken) {
            throw new ApiError(402, "Invalid Token");
        }

        const bearerPatient = await prisma.patient.findUnique({
            where: { patient_id: decodedToken.patient_id }
        });

        if (!bearerPatient) {
            throw new ApiError(404, "Patient with the corresponding Refresh Token is not Found");
        }

        if (incomingRefreshToken !== bearerPatient.refreshToken) {
            throw new ApiError(400, "Refresh Token is expired or Used");
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        const generatedAccessToken = generateAccessTokenPatient(bearerPatient);
        const generatedRefreshToken = generateRefreshTokenPatient(bearerPatient);

        await prisma.patient.update({
            where: { patient_id: bearerPatient.patient_id },
            data: { refreshToken: generatedRefreshToken }
        });

        res
            .status(200)
            .cookie("accessToken", generatedAccessToken, options)
            .cookie("refreshToken", generatedRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { generatedAccessToken, generatedRefreshToken },
                    "Access Token Refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(403, "Access Token failed to be Refreshed", error);
    }
});

let otpStore = {};

export const sendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is Required");
    }

    const patient = await prisma.patient.findUnique({
        where: { email }
    });

    if (!patient) {
        throw new ApiError(404, "Patient Not Found");
    }

    const otp = Math.floor(10000 + Math.random() * 90000);
    otpStore[email] = otp;

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Request for Password Reset',
        text: `Your OTP is ${otp} Kindly choose a new password`
    });

    return res.status(200).json(new ApiResponse(200, "OTP Sent Successfully"));
});

export const verifyOtp = asyncHandler(async (req, res) => {
    const { email, userGivenOtp, newPassword } = req.body;

    if (otpStore[email] != userGivenOtp) {
        throw new ApiError(400, "Invalid OTP");
    }

    const hashedPassword = await hashPatientPassword(newPassword);

    await prisma.patient.update({
        where: { email },
        data: { password: hashedPassword }
    });

    delete otpStore[email];

    return res.status(200).json(new ApiResponse(200, "Password Updated Successfully"));
});

export const getCurrentPatient = asyncHandler(async (req, res) => {    
    try {
        const patient = await prisma.patient.findUnique({
            where: { patient_id: req.user.patient_id }, 
            select: {
                patient_id: true,
                full_name: true,
                email: true,
                contact_number: true,
                age: true,
                gender: true,
            }
        });

        if (!patient) {
            throw new ApiError(404, "Patient Not Found");
        }

        return res.status(200).json(
            new ApiResponse(200, patient, "Patient Fetched Successfully")
        );

    } catch (error) {
        throw new ApiError(500, error);
    }
});


export const updatePatientInfo = asyncHandler(async (req, res) => {
    const {
        full_name,
        contact_number,
        age,
        gender,
    } = req.body;

    const updatedPatient = await prisma.patient.update({
        where: { patient_id: req.user.patient_id },
        data: {
            full_name: full_name || undefined,
            contact_number: contact_number || undefined,
            age: age || undefined,
            gender: gender || undefined
        },
        select: {
            patient_id: true,
                full_name: true,
                contact_number: true,
                age: true,
                gender: true,
        }
    });

    return res.status(200).json(new ApiResponse(200, updatedPatient, "Patient Info Updated Successfully"));
});



