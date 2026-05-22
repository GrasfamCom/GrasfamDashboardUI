export const setupWebSocket = () => {
    if (import.meta.env.VITE_HOST_ENV === 'Local') {
        const socket = new WebSocket('ws://localhost:5178');

        socket.onopen = () => {
            console.log('[DashboardUI] Connected to WebSocket server');
        };

        socket.onmessage = (message) => {
            const msg = JSON.parse(message.data);
            if (msg && msg.type === 'page-reload') {
                console.log('[DashboardUI] Detected remote app update. Reloading...');
                window.location.reload();
            }
        };

        socket.onerror = (error) => {
            console.error('[DashboardUI] WebSocket error:', error);
        };

        // Return a cleanup function to close the WebSocket
        return () => {
            console.log('[DashboardUI] Closing WebSocket connection');
            socket.close();
        };
    }

    // Return a no-op cleanup function if not in Local env
    return () => { };
};
