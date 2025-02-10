import { model } from "../config/geminiAI.js";

export const renderDiagnoser = (req, res) => {
  const messages = req.session.messages ? [...req.session.messages] : []; // Copy messages

  // Clear session messages BEFORE rendering
  req.session.messages = [];

  res.render("aiDiagnoser", { messages });
};

export const handleUserInput = async (req, res) => {
  const userInput = req.body.userInput;
  if (!req.session.messages) req.session.messages = [];

  req.session.messages.push({ type: "user", text: userInput });

  try {
    const result = await model.generateContent(userInput);
    let aiResponse = result.response.text();
    aiResponse = aiResponse.replace(/[*_`~]/g, "");

    req.session.messages.push({ type: "ai", text: aiResponse });

    res.redirect("/diagnoser"); // Redirect back to the chat page
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating response from AI.");
  }
};

