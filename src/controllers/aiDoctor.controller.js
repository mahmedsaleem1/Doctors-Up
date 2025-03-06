import { model } from "../config/geminiAI.js";
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const generateAIResponse = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    throw new ApiError(400, "Message is required");
  }

  const result = await model.generateContent(message);
  let aiResponse = result.response.text();
  aiResponse = aiResponse.replace(/[*_`~]/g, "");

  return res
    .status(200)
    .json(new ApiResponse(200, aiResponse, "AI Response Generated Successfully"));
});
