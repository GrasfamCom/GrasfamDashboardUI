export const setupWebSocket = () => {
  if (import.meta.env.VITE_HOST_ENV === 'Development') {
    // to test for Dashboard App
    const socket = new WebSocket('ws://localhost:5178');

    socket.onopen = () => {
      console.log('Dashboard connected to WebSocket server');
    };

    socket.onmessage = (message) => {
      let msg = JSON.parse(message.data);
      if (msg && msg.type === 'page-reload') {
        console.log('Detected remote app update. Reloading...');
        window.location.reload();
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Return a cleanup function to close the WebSocket
    return () => {
      console.log('Closing WebSocket connection');
      socket.close();
    };
  }

  // Return a no-op cleanup function if not in Development
  return () => {};
};
