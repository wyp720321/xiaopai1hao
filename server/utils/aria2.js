const { spawn } = require('child_process');
const path = require('path');

// This requires 'aria2' to be installed on the server
// sudo apt-get install aria2

exports.downloadFile = (url, downloadPath, onProgress, onComplete, onError) => {
  const aria2 = spawn('aria2c', [
    url,
    '-d', downloadPath,
    '--summary-interval=1',
    '--max-connection-per-server=8'
  ]);

  aria2.stdout.on('data', (data) => {
    const output = data.toString();
    // Parse aria2 output for progress (Regex logic needed here)
    // Simple example:
    if (output.includes('%')) {
        // Extract percentage
        onProgress(output); 
    }
  });

  aria2.stderr.on('data', (data) => {
    console.error(`aria2 error: ${data}`);
  });

  aria2.on('close', (code) => {
    if (code === 0) {
      onComplete();
    } else {
      onError(`Process exited with code ${code}`);
    }
  });

  return aria2;
};