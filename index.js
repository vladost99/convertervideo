const express = require('express');
const handbrake = require('handbrake-js');
const multer = require('multer');
const fs = require('fs');
const tmp = require('tmp');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
//const admin = require('firebase-admin');
const functions = require('firebase-functions');
app.use(express.json())


//admin.initializeApp();

app.use(cors({origin: true}));
//app.use(bodyParser.text({type: '/'}));

const storage = multer.memoryStorage(); // Use MemoryStorage instead of DiskStorage

const upload = multer({ storage, limits: {
  fileSize: 5 * 1024 * 1024, // Maximum file size (in bytes) allowed (e.g., 5MB)
}, });

app.post('/', upload.single('video'), (req, res) => {
  const videoFile = req.file;

  // Create temporary files for input and output
  const inputTempFilePath = tmp.tmpNameSync({ postfix: '.webm' }); // adjust according to input format
  const outputTempFilePath = tmp.tmpNameSync({ postfix: '.mp4' });

  // Write the uploaded file to the input temporary file
  fs.writeFileSync(inputTempFilePath, videoFile.buffer);

  const options = {
    input: inputTempFilePath,
    output: outputTempFilePath,
    width: 640, // specify your desired width
    height: 480, // specify your desired height
  };

  handbrake.spawn(options)
    .on('error', err => {
      console.error('Video conversion error:', err);
      res.status(500).send('An error occurred during video conversion.');
    })
    .on('end', () => {
      const convertedVideo = fs.readFileSync(outputTempFilePath);
      res.set('Content-Type', 'video/mp4');
      res.set('Content-Length', convertedVideo.length);
      res.send(convertedVideo);

      // Clean up temporary files
      fs.unlinkSync(inputTempFilePath);
      fs.unlinkSync(outputTempFilePath);
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// const runtimeOpts = {
//   timeoutSeconds: 540,
//   memory: '1GB'
// }

// exports.convertvideo = functions.runWith(runtimeOpts).https.onRequest(app);