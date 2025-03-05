/*
  Warnings:

  - You are about to drop the `Appointment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Doctor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "Appointment" DROP CONSTRAINT "Appointment_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_appointment_id_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_appointment_id_fkey";

-- DropTable
DROP TABLE "Appointment";

-- DropTable
DROP TABLE "Doctor";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "Review";

-- CreateTable
CREATE TABLE "Doctors" (
    "doctor_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "experience_years" INTEGER NOT NULL,
    "profile_picture" TEXT,
    "about" TEXT,
    "availability_status" TEXT NOT NULL,
    "consultation_fee" INTEGER NOT NULL,
    "video_intro" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,

    CONSTRAINT "Doctors_pkey" PRIMARY KEY ("doctor_id")
);

-- CreateTable
CREATE TABLE "Appointments" (
    "appointment_id" TEXT NOT NULL,
    "appointment_date" TIMESTAMP(3) NOT NULL,
    "appointment_time" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "payment_status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "doctor_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,

    CONSTRAINT "Appointments_pkey" PRIMARY KEY ("appointment_id")
);

-- CreateTable
CREATE TABLE "Payments" (
    "payment_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "payment_method" TEXT NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "payment_status" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "Reviews" (
    "review_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appointment_id" TEXT NOT NULL,

    CONSTRAINT "Reviews_pkey" PRIMARY KEY ("review_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Doctors_email_key" ON "Doctors"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Payments_appointment_id_key" ON "Payments"("appointment_id");

-- CreateIndex
CREATE UNIQUE INDEX "Reviews_appointment_id_key" ON "Reviews"("appointment_id");

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "Doctors"("doctor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointments" ADD CONSTRAINT "Appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "Patient"("patient_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payments" ADD CONSTRAINT "Payments_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointments"("appointment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "Appointments"("appointment_id") ON DELETE CASCADE ON UPDATE CASCADE;
