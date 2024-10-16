const connectWebSocket = (): WebSocket => {
  const socket = new WebSocket('ws://localhost:3001/ws');

  socket.onopen = () => {
    console.log('WebSocket connected');
  };

  socket.onmessage = (event: MessageEvent) => {
    console.log('Message from server:', event.data);
  };

  socket.onclose = () => {
    console.log('WebSocket disconnected');
  };

  return socket;
};

export default connectWebSocket;
