import { io } from 'socket.io-client';
import { API_BASE } from '../api/client';

let socket;
export function getSocket(token) {
  if (!socket) {
    socket = io(API_BASE, { auth: { token } });
  }
  return socket;
}
export function closeSocket() {
  if (socket) { socket.disconnect(); socket = null; }
}