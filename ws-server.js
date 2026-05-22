import WebSocket, { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import path from 'path';

// Path to the remote app's build directory
const remoteBuildPath = path.resolve('./dist');

// Create WebSocket server
const wss = new WebSocketServer({ port: 5178 });

wss.on('connection', (ws) => {
  console.log('Host app connected to WebSocket server');
});

wss.on('error', (err) => {
  console.error('WebSocket Server Error:', err);
});

// Watch for changes in the remote app build directory
chokidar.watch(remoteBuildPath).on('all', (event, filePath) => {
  console.log(`Detected ${event} in remote app: ${filePath}`);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send('reload'); // Notify host app to reload
    }
  });
});
