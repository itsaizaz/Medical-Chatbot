const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { exec } = require("child_process");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // Use PORT from environment variables if available

app.use(bodyParser.json());
app.use(cors());

// Serve static files from the 'public' directory
app.use("/audios/", express.static(path.join(__dirname, "./uploads")));
app.use(express.static(path.join(__dirname, "public")));
// Serve the frontend
app.use(express.static(path.join(__dirname, "../", "web-frontend")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../", "web-frontend", "index.html"));
});

// Import routes
const messageRoutes = require("./routes");
app.use(messageRoutes);

const server = app.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}/`);
  // Automatically open the browser if on a local environment (optional)
  if (process.env.NODE_ENV !== "production") {
    exec(`open http://127.0.0.1:${PORT}/`);
  }
});
