import { io, Socket } from 'socket.io-client';
import { clientEnv } from '../env';
import bcrypt from 'bcryptjs';

interface GameScore {
  set: number;
  game: number;
  game_score_home: string | number;
  game_score_away: string | number;
}

interface MatchScoreData {
  matchUuid: string;
  score: GameScore[];
}

type MatchScoreCallback = (matches: MatchScoreData[]) => void;

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, MatchScoreCallback[]> = new Map();

  async connect(): Promise<boolean> {
    try {
      if (this.socket?.connected) {
        return true;
      }

      console.log('Attempting to connect to WebSocket at:', clientEnv.SOCKET_URL);
      console.log('Using secret key:', clientEnv.SOCKET_SECRET_KEY ? 'Provided' : 'Missing');

      // Simple connection to base URL
      this.socket = io('http://localhost:3000', {
        auth: {
          secretKey: clientEnv.SOCKET_SECRET_KEY
        }
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected successfully');
        this.reconnectAttempts = 0;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error.message);
        console.error('Full error details:', error);
        console.error('Connection URL:', clientEnv.SOCKET_URL);
        console.error('Path:', '/ws');
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('Max reconnection attempts reached');
        }
      });

      this.socket.on('match_score_updated', (data: MatchScoreData[]) => {
        this.notifyListeners(data);
      });

      return new Promise((resolve) => {
        if (this.socket) {
          this.socket.on('connect', () => resolve(true));
          this.socket.on('connect_error', () => resolve(false));
        } else {
          resolve(false);
        }
      });

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      return false;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
  }

  onMatchScoreUpdate(callback: MatchScoreCallback) {
    const callbacks = this.listeners.get('match_score_updated') || [];
    callbacks.push(callback);
    this.listeners.set('match_score_updated', callbacks);

    return () => {
      const currentCallbacks = this.listeners.get('match_score_updated') || [];
      const index = currentCallbacks.indexOf(callback);
      if (index > -1) {
        currentCallbacks.splice(index, 1);
        this.listeners.set('match_score_updated', currentCallbacks);
      }
    };
  }

  private notifyListeners(data: MatchScoreData[]) {
    const callbacks = this.listeners.get('match_score_updated') || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in match score callback:', error);
      }
    });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export default new SocketService();
export type { MatchScoreData, GameScore, MatchScoreCallback };
