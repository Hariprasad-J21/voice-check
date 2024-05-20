const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;
const cors = require("cors");

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
    // console.log("1");
    chunk.push(data);
  });

  req.on("end", () => {
    // console.log("2");
    audioChunks.push(Buffer.concat(chunk));
    if (isFinalChunk) {
      const outputPath = path.join(audioDir, `audio-${Date.now()}.webm`);
      fs.writeFile(outputPath, Buffer.concat(audioChunks), (err) => {
        if (err) {
          return res.status(500).send("Error saving audio file");
        }
        audioChunks = []; // Clear the chunks after saving
        res.send("Audio file saved successfully");
        console.log("Audio file saved successfully");
      });
    } else {
      res.sendStatus(200);
    }
  });
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
