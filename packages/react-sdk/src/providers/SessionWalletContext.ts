import * as React from 'react';
import { createContext, useContext, useState } from 'react';
import { SessionWalletInterface } from '..';

interface SessionWalletContextInterface extends SessionWalletInterface {
  sessionCreated: boolean;
  setSessionCreated: (sessionCreated: boolean) => void;
}

const SessionWalletContext = createContext<SessionWalletInterface | null>(null);

export const useSessionWallet = () => {
  const context = useContext(SessionWalletContext);
  if (!context) {
    throw new Error('useSessionWallet must be used within a SessionWalletProvider');
  }
  return context;
};

interface SessionWalletProviderProps {
  sessionWallet: SessionWalletInterface;
  children: React.ReactNode;
}

export const SessionWalletProvider: React.FC<SessionWalletProviderProps> = ({ sessionWallet, children }) => {
  const [sessionCreated, setSessionCreated] = useState(false);

  React.useEffect(() => {
    if (sessionWallet.sessionToken) {
      setSessionCreated(true);
    }
  }, [sessionWallet.sessionToken]);

  const value: SessionWalletContextInterface = {
    ...sessionWallet,
    sessionCreated,
    setSessionCreated,
  };

  return (
    React.createElement(SessionWalletContext.Provider, { value }, children)
  );
};
