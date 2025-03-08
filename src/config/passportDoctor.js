import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from './prismaDb.js';
import dotenv from 'dotenv';

const DocPassport = passport;

dotenv.config();

DocPassport.use("doctor-google", new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL_DOCTOR,
    passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const fullName = profile.displayName;

        let doctor = await prisma.doctors.findUnique({ where: { email } });
        let unregsiteredDoctor = false;
        // If doctor does not exist, create a new one
        if (!doctor || doctor.specialty === "null") {
          unregsiteredDoctor = true;
        }
        if (!doctor) {
            doctor = await prisma.doctors.create({
              data: {
                email,
                full_name: fullName,
                password: "null", // No password for OAuth
                specialty: "null",
                qualification: "null",
                experience_years: 0,
                about: "null",
                availability_status: "null",
                consultation_fee: 0,
              },
            });
        }
        
        req.user = { email: doctor.email, UnRegistered: unregsiteredDoctor };
        done(null, req.user);
      } catch (err) {
        console.error(err);
        done(err, null);
      }
    }
  )
);

DocPassport.serializeUser((doctor, done) => {
  done(null, doctor);
});

DocPassport.deserializeUser(async (doctor, done) => {
  try {
    const foundDoctor =
      await prisma.doctors.findUnique({ where: { email: doctor.email } })

    done(null, foundDoctor);
  } catch (err) {
    done(err, null);
  }
});

export default DocPassport;
