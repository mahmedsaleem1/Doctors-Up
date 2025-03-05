-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Doctors Table with UUID
CREATE TABLE "Doctors"(
    "doctor_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "full_name" VARCHAR(255) NOT NULL,
    "specialty" VARCHAR(255) NOT NULL,
    "qualification" VARCHAR(255) NOT NULL,
    "experience_years" SMALLINT NOT NULL,
    "profile_picture" VARCHAR(255),
    "about" TEXT,
    "availability_status" VARCHAR(50) CHECK ("availability_status" IN('Available', 'Unavailable')) NOT NULL,
    "consultation_fee" SMALLINT NOT NULL CHECK ("consultation_fee" > 0),
    "video_intro" VARCHAR(255),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "accessToken" VARCHAR(255),
    "refreshToken" VARCHAR(255)
);

-- Patients Table with UUID
CREATE TABLE "Patient"(
    "patient_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "full_name" VARCHAR(255) NOT NULL,
    "age" SMALLINT NOT NULL CHECK ("age" > 0),
    "gender" VARCHAR(50) CHECK ("gender" IN('Male', 'Female', 'Other')) NOT NULL,
    "contact_number" VARCHAR(20) NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "accessToken" VARCHAR(255),
    "refreshToken" VARCHAR(255)
);

-- Appointments Table with UUID
CREATE TABLE "Appointments"(
    "appointment_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "doctor_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "appointment_date" DATE NOT NULL,
    "appointment_time" TIME NOT NULL,
    "status" VARCHAR(50) CHECK ("status" IN('Pending', 'Confirmed', 'Cancelled')) NOT NULL,
    "payment_status" VARCHAR(50) CHECK ("payment_status" IN('Pending', 'Paid', 'Failed')) NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY("doctor_id") REFERENCES "Doctors"("doctor_id") ON DELETE CASCADE,
    FOREIGN KEY("patient_id") REFERENCES "Patient"("patient_id") ON DELETE CASCADE
);

-- Payments Table with UUID
CREATE TABLE "Payments"(
    "payment_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "appointment_id" UUID NOT NULL,
    "amount" SMALLINT NOT NULL CHECK ("amount" > 0),
    "payment_method" VARCHAR(50) CHECK ("payment_method" IN('Card', 'Cash', 'Online')) NOT NULL,
    "payment_date" DATE NOT NULL,
    "payment_status" VARCHAR(50) CHECK ("payment_status" IN('Pending', 'Completed', 'Failed')) NOT NULL,
    FOREIGN KEY("appointment_id") REFERENCES "Appointments"("appointment_id") ON DELETE CASCADE
);

-- Reviews Table with UUID
CREATE TABLE "Reviews"(
    "review_id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "appointment_id" UUID NOT NULL UNIQUE,
    "rating" INTEGER NOT NULL CHECK ("rating" BETWEEN 1 AND 5),
    "comment" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY("appointment_id") REFERENCES "Appointments"("appointment_id") ON DELETE CASCADE
);
