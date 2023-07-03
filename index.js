const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const { Readable,  } = require('stream');
const multer = require('multer');
const cors = require('cors');
const app = express();




app.use(cors({origin: true}));
app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({limit: "50mb", extended: true}));



// Configure multer to store files in memory
const upload = multer({
    storage: multer.memoryStorage()
});




app.post('/', upload.single('video'), (req, res) => {
  let fileBody = req.file;
  console.log(fileBody);
  const videoBuffer = fileBody.buffer;
  const readable = new Readable();
  readable._read = () => {}; // _read is required but you can noop it
  readable.push(videoBuffer);
  readable.push(null);

  // Begin the ffmpeg child process
  const ffmpegProcess = ffmpeg(readable)
  .inputFormat('webm')
  .outputFormat('mp4')
  .size('640x480')  // Add this line to resize the video
  .videoBitrate('512k')
  .outputOptions('-movflags frag_keyframe+empty_moov')
  .on('error', (error) => {
      console.error(error);
      res.status(500).send('An error occurred during conversion');
  });

// Pipe the output of ffmpeg to res
res.setHeader('Content-Type', 'video/mp4');
// this prompts the client to download the file as output.mp4
ffmpegProcess.pipe(res, { end: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

