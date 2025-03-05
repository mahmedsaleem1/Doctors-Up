import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse} from '../utils/apiResponse.js';
import { prisma } from '../config/prismaDb.js';
import { hashDoctorPassword,
        isPasswordValid,
        generateAccessTokenDoctor,
        generateRefreshTokenDoctor } from '../services/doctor.services.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js'

export const generateAccessAndRefreshToken = async (doctor) => {
    try {
        const genAccessToken = generateAccessTokenDoctor(doctor);
        const genRefreshToken = generateRefreshTokenDoctor(doctor);
                
        await prisma.doctors.update({
            where: { doctor_id: doctor.doctor_id }, // Yeh sahi field hai
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

export const registerDoctor = asyncHandler(async (req, res, next) => {
    const { fullname, specialty, qualification, experience,
        about, availability, fee, email, password } = req.body;

    if (!fullname || !specialty || !qualification || !experience 
        || !about || !availability || !fee || !email || !password) {
            throw new ApiError(400, "All Fields are Required")
    }
       
    const existedDoctor = await prisma.doctors.findUnique({
        where: {
            email
        }
    });

    if (existedDoctor) {
        throw new ApiError(400, "Doctor Already Exists")
    }

    let profilePicLocalPath, videoLocalPath;

    if (!req.files.profile_picture || !req.files.video_intro) {
        throw new ApiError(400, "Profile Picture and Video Intro are Required")
        }
    
    profilePicLocalPath = req.files.profile_picture[0].path;
    videoLocalPath = req.files.video_intro[0].path;

    const profilePicCloudinary = await uploadOnCloudinary(profilePicLocalPath);

    if(!profilePicCloudinary) {
        throw new ApiError(500, "Profile Picture Upload Failed")
    }

    const videoCloudinary = await uploadOnCloudinary(videoLocalPath);

    if(!videoCloudinary) {
        throw new ApiError(500, "Video Upload Failed")
    }

    const createdDoctor = await prisma.doctors.create({
        data: {
            full_name: fullname, // ✅ Yeh ab sahi hai
            specialty,
            qualification,
            experience_years: parseInt(experience), // ✅ Yeh bhi sahi
            about,
            availability_status: availability, // ✅ Yeh bhi sahi
            consultation_fee: parseInt(fee), // ✅ Yeh bhi sahi
            email,
            password: await hashDoctorPassword(password),
            profile_picture: profilePicCloudinary.url,
            video_intro: videoCloudinary.url
        }
    });

    if (!createdDoctor) {
        throw new ApiError(500, "Doctor Registration Failed")
    }

    return res.status(201).json(new ApiResponse(201, "Doctor Registered Successfully"));
});

export const loginDoctor = asyncHandler(async (req, res, next) => {
    const {email, password} = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and Password are Required")
    }

    const doctorTobeLoggedIn = await prisma.doctors.findUnique({
        where: {
            email
        }
    });

    if (!doctorTobeLoggedIn) {
        throw new ApiError(404, "Doctor Not Found")
    }

    const isPasswordMatched = await isPasswordValid(password, doctorTobeLoggedIn.password);

    if (!isPasswordMatched) {
        throw new ApiError(401, "Invalid Credentials")
    }

    const { genAccessToken, genRefreshToken } = await generateAccessAndRefreshToken(doctorTobeLoggedIn);
    
    const doctorToBeSent = await prisma.doctors.findUnique({
        where: { email },
        select: {
            password: false,       // Hide password
            refreshToken: false,   // Hide refreshToken
            accessToken: false,    // Hide accessToken
            doctor_id: true,
            full_name: true,
            email: true,
            specialty: true,
            profile_picture: true,
            availability_status: true,
            consultation_fee: true,
            video_intro: true,
            experience_years: true
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
        .json(new ApiResponse(200, doctorToBeSent,"Doctor Logged In Successfully"));
});

export const logoutDoctor = asyncHandler(async (req, res, next) => {
    if (!req.user.doctor_id) {
        return res.status(401).json({ message: "Invalid Token" });
    }

    await prisma.doctors.update({
        where: { doctor_id: req.user.doctor_id },
        data: { refreshToken: null }
    });

    res.clearCookie("accessToken", { httpOnly: true });
    res.clearCookie("refreshToken", { httpOnly: true });
    res.status(200).json({ message: "Doctor Logged Out Successfully" });
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized Request");
        }

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.DOCTOR_REFRESH_TOKEN_SECRET);

        if (!decodedToken) {
            throw new ApiError(402, "Invalid Token");
        }

        const bearerDoctor = await prisma.doctors.findUnique({
            where: { doctor_id: decodedToken.doctor_id }
        });

        if (!bearerDoctor) {
            throw new ApiError(404, "Doctor with the corresponding Refresh Token is not Found");
        }

        if (incomingRefreshToken !== bearerDoctor.refreshToken) {
            throw new ApiError(400, "Refresh Token is expired or Used");
        }

        const options = {
            httpOnly: true,
            secure: true
        };

        const generatedAccessToken = generateAccessTokenDoctor(bearerDoctor);
        const generatedRefreshToken = generateRefreshTokenDoctor(bearerDoctor);

        await prisma.doctors.update({
            where: { doctor_id: bearerDoctor.doctor_id },
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

