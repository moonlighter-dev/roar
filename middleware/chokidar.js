const chokidar = require('chokidar');
const axios = require('axios');
const fs = require('fs');
const path = require('path');


module.exports = {
watchJournal: () => {

const filePath = path.join(__dirname, 'WOODSAW.JNL');

// Watch the file for changes
const watcher = chokidar.watch(filePath);

// Set up event listeners for file change events
watcher.on('change', () => {
  // Read the updated content of the file
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    // Send the updated content to the "/pos" route
    // using an HTTP POST request
    const updatedText = data.toString();
    const postData = { text: updatedText };

    // Make an HTTP POST request
    axios.post('/pos', postData)
      .then(() => {
        console.log('File change uploaded successfully!');
      })
      .catch((error) => {
        console.error('Error uploading file change:', error);
      });
  });
});
}
}