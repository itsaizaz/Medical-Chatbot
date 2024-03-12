const express = require("express");
const multer = require("multer");
const { handleMessage, handleVoiceInput, handleTextToSpeech } = require("../controllers/messageController");

const router = express.Router();

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Route to handle text-based messages
router.post("/message", handleMessage);

// Route to handle voice input. This assumes you have a "voice" field in the form that uploads the audio file.
router.post("/voice", upload.single('voice'), handleVoiceInput);

// Route to handle text-to-speech requests
router.post("/text-to-speech", handleTextToSpeech);

// Route to serve generated speech files, assuming they are stored in a 'public' directory
router.get('/speech/:filename', (req, res) => {
  const filename = req.params.filename;
  res.sendFile(`${__dirname}/../uploads/${filename}`);
});

module.exports = router;

