import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from './prismaDb.js';
import dotenv from 'dotenv';

dotenv.config();

const PatientPassport = passport;

PatientPassport.use("patient-google", new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL_PATIENT,
    passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const fullName = profile.displayName;

        let patient = await prisma.patient.findUnique({ where: { email } });
        let unregisteredPatient = false;

        if (!patient || patient.age === 0) {
            unregisteredPatient = true;
        }

        // If patient does not exist, create a new one
        if (!patient) {
            patient = await prisma.patient.create({
                data: {
                    email,
                    full_name: fullName,
                    password: "null", // No password for OAuth
                    age: 0, 
                    gender: "Male", 
                    contact_number: "0",
                  },
            });
        }

        req.user = { email: patient.email, UnRegistered: unregisteredPatient };
        done(null, req.user);
      } catch (err) {
        console.error(err);
        done(err, null);
      }
    }
  )
);

PatientPassport.serializeUser((patient, done) => {
  done(null, patient);
});

PatientPassport.deserializeUser(async (patient, done) => {
  try {
    const foundPatient =
      await prisma.patient.findUnique({ where: { email: patient.email } })

    done(null, foundPatient);
  } catch (err) {
    done(err, null);
  }
});

export default PatientPassport;
