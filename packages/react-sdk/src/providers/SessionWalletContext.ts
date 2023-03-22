import * as React from 'react';
import { createContext, useContext } from 'react';
import { SessionWalletInterface } from '..';

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
  return React.createElement(
    SessionWalletContext.Provider,
    { value: sessionWallet },
    children
  );
};

