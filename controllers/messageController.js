const { response } = require("express");
const {
  callGPT,
  transcribeSpeech,
  generateSpeech
} = require("../services/openaiService");
const fs = require("fs");
const path = require("path");

const system = `Chatbot context`;

let chatLog =
  "Chat Log: Chat Bot: Hi, I'm a Chat Bot. What can I help you with today?\n";

async function handleMessage(req, res) {
  const content = req.body.message;

  if (content.trim() === "") {
    return res.status(400).json({ error: "Empty message" });
  }

  const response = await callGPT(content, system, chatLog);

  chatLog += "User: " + content + "\n";
  chatLog += "Chat Bot: " + response + "\n";

  return res.json({ message: response });
}

async function handleVoiceInput(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  try {
    const filePath = req.file.path;
    const text = await transcribeSpeech(filePath); // Transcribe the speech to text
    fs.unlinkSync(filePath); // Cleanup the uploaded file

    const responseText = await callGPT(text, system, chatLog); // Get a response for the transcribed text

    // Update chat log
    chatLog += "User: " + text + "\n";
    chatLog += "Chat Bot: " + responseText + "\n";
    console.log("chatbot : ", responseText);

    // Convert the response text to speech
    const { filePath: audioPath, filename } = await generateSpeech(
      responseText
    );

    console.log(
      "file path: ",
      filePath,
      "audio path ",
      audioPath,
      "filename ",
      filename
    );

    // Send the URL/path of the generated audio file back to the frontend
    return res.json({ message: responseText, audioPath: filename.trim() });
  } catch (error) {
    console.error("Error processing voice input:", error);
    return res.status(500).json({ error: "Error processing voice input." });
  }
}

async function handleTextToSpeech(req, res) {
  const text = req.body.text;
  if (!text) {
    return res.status(400).json({ error: "Empty text." });
  }

  try {
    const { filePath, filename } = await generateSpeech(text);
    return res.json({
      message: "Speech generated successfully.",
      path: `/speech/${filename}`
    });
  } catch (error) {
    console.error("Error generating speech:", error);
    return res.status(500).json({ error: "Error generating speech." });
  }
}

module.exports = { handleMessage, handleVoiceInput, handleTextToSpeech };
