'use client';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/auth.store';

export function useSocket(namespace = '') {
  const socketRef = useRef<Socket | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_SOCKET_URL}${namespace}`;
    socketRef.current = io(url, { auth: { token }, transports: ['websocket'] });
    return () => { socketRef.current?.disconnect(); };
  }, [token, namespace]);

  return socketRef.current;
}
