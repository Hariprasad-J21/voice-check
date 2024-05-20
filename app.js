const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;
const cors = require("cors");
const admin = require("firebase-admin"); // Include firebase-admin

// Initialize Firebase app with your credentials
admin.initializeApp({
  apiKey: "AIzaSyDd7tTWW5Cvvma_1mja3ahckpMdzZdkXio",
  authDomain: "store-voice.firebaseapp.com",
  projectId: "store-voice",
  storageBucket: "store-voice.appspot.com",
  messagingSenderId: "832299608616",
  appId: "1:832299608616:web:42439fec05d38564ebe31d",
});

const bucket = admin.storage().bucket(); // Get a reference to the storage bucket

app.use(cors());

const audioDir = path.join(__dirname, "audio");
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir);
}

let audioChunks = [];

app.post("/upload", (req, res) => {
  const isFinalChunk = req.query.final === "true";
  let chunk = [];

  req.on("data", (data) => {
    chunk.push(data);
  });

  req.on("end", async () => {
    // Combine audio chunks
    const audioBuffer = Buffer.concat(chunk);

    if (isFinalChunk) {
      const fileName = `audio-${Date.now()}.webm`; // Generate filename

      try {
        // Upload audio to Firebase Storage
        const file = bucket.file(fileName);
        await file.write(audioBuffer);

        audioChunks = []; // Clear the chunks after saving
        res.send("Audio file uploaded successfully to Firebase Storage");
        console.log("Audio file uploaded successfully to Firebase Storage");
      } catch (error) {
        console.error("Error uploading audio to Firebase Storage:", error);
        return res.status(500).send("Error uploading audio file");
      }
    } else {
      res.sendStatus(200);
    }
  });
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
