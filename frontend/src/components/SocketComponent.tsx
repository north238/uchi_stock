import React, { useEffect } from 'react';
import connectWebSocket from '../util/websocket';

const SocketComponent: React.FC = () => {
  useEffect(() => {
    const socket = connectWebSocket();

    // クリーンアップ関数でWebSocketを閉じる
    return () => {
      socket.close();
    };
  }, []);

  return <div>WebSocket Example</div>;
};

export default SocketComponent;
