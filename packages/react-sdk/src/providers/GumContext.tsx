import * as React from 'react';
import { createContext, useContext, useMemo, ReactNode } from 'react';
import { SDK } from '@gumhq/sdk';

interface GumContextValue {
  sdk: SDK;
}

const GumContext = createContext<GumContextValue | null>(null);

interface GumProviderProps {
  children: ReactNode;
  sdk: SDK;
}

const GumProvider: React.FC<GumProviderProps> = ({  children, sdk }) => {
  return <GumContext.Provider value={{ sdk }}>{children}</GumContext.Provider>;
};

const useGumContext = (): GumContextValue => {
  const context = useContext(GumContext);
  if (!context) {
    throw new Error('useGumContext must be used within a GumProvider');
  }
  return context;
};

export { GumProvider, useGumContext };
