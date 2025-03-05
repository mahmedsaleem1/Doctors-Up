import { prisma } from '../config/prismaDb.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const hashDoctorPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};