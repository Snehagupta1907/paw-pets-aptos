"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AUTO_CONNECT_LOCAL_STORAGE_KEY = "AptosWalletAutoConnect";

// Create context with default values
export const AutoConnectContext = createContext({
  autoConnect: false,
  setAutoConnect: () => {
    console.warn('setAutoConnect called before provider was initialized');
  },
  isDisconnecting: false,
  setIsDisconnecting: () => {
    console.warn('setIsDisconnecting called before provider was initialized');
  }
});

export function useAutoConnect() {
  const context = useContext(AutoConnectContext);
  if (!context) {
    throw new Error('useAutoConnect must be used within an AutoConnectProvider');
  }
  return context;
}

export const AutoConnectProvider = ({ children }) => {
  const [autoConnect, setAutoConnect] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Wait until the app hydrates before populating `autoConnect` from local storage
    try {
      const isAutoConnect = localStorage.getItem(
        AUTO_CONNECT_LOCAL_STORAGE_KEY,
      );
      if (isAutoConnect) {
        setAutoConnect(JSON.parse(isAutoConnect));
      }
    } catch (e) {
      if (typeof window !== "undefined") {
        console.error('Error reading auto-connect from localStorage:', e);
      }
    } finally {
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      if (!autoConnect) {
        localStorage.removeItem(AUTO_CONNECT_LOCAL_STORAGE_KEY);
      } else {
        localStorage.setItem(
          AUTO_CONNECT_LOCAL_STORAGE_KEY,
          JSON.stringify(autoConnect),
        );
      }
    } catch (error) {
      if (typeof window !== "undefined") {
        console.error('Error writing auto-connect to localStorage:', error);
      }
    }
  }, [autoConnect, isInitialized]);

  const contextValue = {
    autoConnect,
    setAutoConnect: (value) => {
      console.log('Setting autoConnect to:', value);
      setAutoConnect(value);
    },
    isDisconnecting,
    setIsDisconnecting: (value) => {
      console.log('Setting isDisconnecting to:', value);
      setIsDisconnecting(value);
    }
  };

  return (
    <AutoConnectContext.Provider value={contextValue}>
      {children}
    </AutoConnectContext.Provider>
  );
}; 