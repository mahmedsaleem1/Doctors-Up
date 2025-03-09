import { importHospitals } from "../services/hospital.services.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const importHospitalData = async (req, res, next) => {
  try {
    const hospitals = await importHospitals();
    return res
      .status(200)
      .json(new ApiResponse(200, hospitals, "Hospitals Imported Successfully"));
  } catch (error) {
    console.log("Controller Error:", error);
    return next(new ApiError(500, "Error Importing Hospitals", error));
  }
};


