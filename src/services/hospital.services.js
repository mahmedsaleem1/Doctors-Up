import { prisma } from "../config/prismaDb.js";
import fs from "fs";
import csv from "csv-parser";

export const importHospitals = async () => {
  const hospitals = [];

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream("./src/data/hospitals.csv").pipe(csv());

    stream.on("data", (data) => {
      hospitals.push(data);
    });

    stream.on("end", async () => {
      try {
        await Promise.all(
          hospitals.map(async (hospital) => {
            if (hospital["Hospital Name"] && hospital["City"]) {
              await prisma.hospital.create({
                data: {
                  name: hospital["Hospital Name"],
                  city: hospital["City"],
                  area: hospital["Area"] || "N/A",
                  availableDoctors: parseInt(hospital["Available Doctors"]) || 0,
                  address: hospital["Address"] || "N/A",
                  contact: hospital["Contact"] || "N/A",
                },
              });
            }
          })
        );
        resolve(hospitals);
      } catch (error) {
        reject(error);
      }
    });

    stream.on("error", (error) => {
      reject(error);
    });
  });
};
