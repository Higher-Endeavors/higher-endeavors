'use client';

import { createContext, useContext, ReactNode } from 'react';

export type Environment = 'development' | 'qa' | 'production';

interface EnvironmentContextType {
  environment: Environment;
  isQA: boolean;
  isProduction: boolean;
  isDevelopment: boolean;
}

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

interface EnvironmentProviderProps {
  children: ReactNode;
  environment: Environment;
}

export function EnvironmentProvider({ children, environment }: EnvironmentProviderProps) {
  const value: EnvironmentContextType = {
    environment,
    isQA: environment === 'qa',
    isProduction: environment === 'production',
    isDevelopment: environment === 'development',
  };

  return (
    <EnvironmentContext.Provider value={value}>
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
}
