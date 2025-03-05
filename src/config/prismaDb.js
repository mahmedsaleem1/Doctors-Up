import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();

// const createDoctor = async () => {
//   const doctor = await prisma.doctors.create({
//     data: {
//       full_name: "Dr. Ahmed",
//       email: "ahmed@gmail.com",
//       specialty: "Cardiologist",
//       qualification: "MBBS",
//       experience_years: 5,
//       availability_status: "Available",
//       consultation_fee: 500,
//       password: "123456" // 🔥 Yahan koi bhi password dedo hash karna baad me
//     },
//   });
//   console.log("Doctor Created:", doctor);
// };

// createDoctor();

// const getDoctors = async () => {
//   const doctors = await prisma.doctors.findMany();
//   console.log(doctors);
// };

// getDoctors();
