import { model } from "../config/geminiAI.js";

export const renderDiagnoser = (req, res) => {
  if (!req.session.messages) req.session.messages = [];

  const messages = [...req.session.messages]; // Copy messages

  res.render("aiDiagnoser", { messages });

  req.session.messages = []; // Clear AFTER rendering
};


export const handleUserInput = async (req, res) => {
  const userInput = req.body.userInput;
  if (!req.session.messages) req.session.messages = [];

  req.session.messages.push({ type: "user", text: userInput });

  try {
    const result = await model.generateContent(userInput);
    const aiResponse = result.response.text();

    req.session.messages.push({ type: "ai", text: aiResponse });

    res.redirect("/diagnoser"); // Redirect back to the chat page
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating response from AI.");
  }
};

