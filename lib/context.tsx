'use client';

import { createContext, useContext, ReactNode } from 'react';

type v0contexttype = {
  isV0: boolean;
};

const V0Context = createContext<V0ContextType | undefined>(undefined);

type v0providerprops = {
  children: reactnode;
  isV0: boolean;
};

export const V0Provider = ({ children, isV0 }: V0ProviderProps) => {
  return <v0context.Provider value={{ isV0 }}>{children}</V0Context.Provider>;
};

export const useIsV0 = (): boolean => {
  const context = useContext(V0Context);
  if (context === undefined) {
    throw new Error('useIsV0 must be used within a V0Provider');
  }
  return context.isV0;
};
