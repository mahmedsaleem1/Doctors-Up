import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse} from '../utils/apiResponse.js';
import { prisma } from '../config/prismaDb.js'
import { cloudinary} from '../utils/cloudinary.js'

const registerUser = 