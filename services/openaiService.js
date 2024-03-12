const { Configuration, OpenAIApi } = require('openai');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();


/**
 * Transcribes speech from an audio file using OpenAI's Whisper model.
 * @param {string|Buffer|Stream} audioInput - The audio file path or stream.
 * @returns {Promise<string>} The transcribed text.
 */

// Initialize OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Function to call GPT with text input
async function callGPT(promptContent, systemContent = "", previousChat = "") {
  try {
    const messages = [];
    if (systemContent) messages.push({ role: "system", content: systemContent });
    if (previousChat) messages.push({ role: "user", content: previousChat });
    messages.push({ role: "user", content: promptContent });

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
    });
    
    return response.data.choices[0].message.content;

  } catch (error) {
    console.error("Error in callGPT:", error);
    throw error;
  }
}

//Function converts speech to text
async function transcribeSpeech(filePath) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath), {
    contentType: 'audio/mp3', // Explicitly setting the MIME type for .m4a files
    knownLength: fs.statSync(filePath).size // This line is optional but can help with upload progress indication
  });
  formData.append('model', 'whisper-1');
  try {
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      params: {
        model: 'whisper-1'
      }
    });

    console.log('Transcription:', response.data.text);
    return response.data.text;
  } catch (error) {
    console.error('Error in transcription:', error.response ? error.response.data : error.message);
  }
}


// Function converts text to speech
async function generateSpeech(text, voiceModel = "tts-1") {
  // Generate a unique filename for each speech file
  const filename = `voice.mp3`;
  const audioPath = path.join(__dirname, '../uploads', filename);

  try {
    const response = await axios.post('https://api.openai.com/v1/audio/speech', {
      model: voiceModel,
      input: text,
      voice: "alloy", // Adjust according to available voices
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer' // Important for receiving binary data
    });

    // Writing the received audio binary data to a file
    fs.writeFileSync(audioPath, Buffer.from(response.data, 'binary'));
    console.log(`Audio file generated at: ${audioPath}`);
    // Return both the full path and the filename
    return { filePath: audioPath, filename };
  } catch (error) {
    console.error("Error in generateSpeech:", error);
    throw error;
  }
}


module.exports = { callGPT,transcribeSpeech,generateSpeech };
