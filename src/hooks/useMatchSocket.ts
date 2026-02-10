import { useState, useEffect, useCallback, useRef } from 'react';
import socketService, { MatchScoreData } from '../utils/socket';

interface UseMatchSocketReturn {
  matches: MatchScoreData[];
  isConnected: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
}

export const useMatchSocket = (): UseMatchSocketReturn => {
  const [matches, setMatches] = useState<MatchScoreData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  const connect = useCallback(async () => {
    try {
      setError(null);
      const connected = await socketService.connect();
      
      if (connected) {
        setIsConnected(true);
        console.log('Successfully connected to WebSocket for match scores');
      } else {
        setError('Failed to connect to WebSocket');
        setIsConnected(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setIsConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
    setError(null);
    
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  const reconnect = useCallback(async () => {
    disconnect();
    await connect();
  }, [connect, disconnect]);

  useEffect(() => {
    const handleScoreUpdate = (data: MatchScoreData[]) => {
      setMatches(data);
    };

    if (isConnected) {
      unsubscribeRef.current = socketService.onMatchScoreUpdate(handleScoreUpdate);
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [isConnected]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return {
    matches,
    isConnected,
    error,
    connect,
    disconnect,
    reconnect
  };
};
