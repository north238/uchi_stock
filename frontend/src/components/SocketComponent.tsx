import React, { useEffect } from 'react';
import connectWebSocket from '../util/websocket';

const SocketComponent: React.FC = () => {
  useEffect(() => {
    console.log('ソケット');

    const socket = connectWebSocket();

    // クリーンアップ関数でWebSocketを閉じる
    return () => {
      socket.close();
    };
  }, []);
  return null;
};

export default SocketComponent;
