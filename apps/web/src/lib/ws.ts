import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/api/events';

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket && typeof window !== 'undefined') {
    socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('⚡ Connected to real-time events gateway');
    });

    socket.on('disconnect', () => {
      console.log('🔌 Disconnected from events gateway');
    });
  }
  return socket;
};

export const subscribeToVideo = (videoId: string, onProgress: (data: any) => void) => {
  const s = getSocket();
  if (!s) return () => {};

  s.emit('subscribe:video', videoId);
  s.on('job:progress', onProgress);

  return () => {
    s.emit('unsubscribe:video', videoId);
    s.off('job:progress', onProgress);
  };
};
