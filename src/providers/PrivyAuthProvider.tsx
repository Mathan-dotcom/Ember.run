import React, { Component, ReactNode } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';

// Monad Testnet Chain Definition for Privy Embedded Wallets
export const monadTestnetChain = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    name: 'Monad',
    symbol: 'MON',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet.monadexplorer.com',
    },
  },
  testnet: true,
};

interface PrivyErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface PrivyErrorBoundaryState {
  hasError: boolean;
}

class PrivyErrorBoundary extends Component<PrivyErrorBoundaryProps, PrivyErrorBoundaryState> {
  constructor(props: PrivyErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('[PrivyAuthProvider] Privy initialization failed or blocked; continuing with resilient passkey fallback:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface PrivyAuthProviderProps {
  children: React.ReactNode;
}

export const PrivyAuthProvider: React.FC<PrivyAuthProviderProps> = ({ children }) => {
  const envAppId = (import.meta.env.VITE_PRIVY_APP_ID as string | undefined)?.trim();
  // Privy strictly mandates that appId must be exactly a 25-character string
  const privyAppId = envAppId && envAppId.length === 25 ? envAppId : 'cm7embermonadtestnet00000';

  return (
    <PrivyErrorBoundary fallback={children}>
      <PrivyProvider
        appId={privyAppId}
        config={{
          loginMethods: ['email', 'wallet', 'google', 'twitter', 'discord', 'github'],
          appearance: {
            theme: 'dark',
            accentColor: '#df9c32',
            logo: 'https://raw.githubusercontent.com/Mathan-dotcom/Ember.run/main/public/favicon.ico',
          },
          defaultChain: monadTestnetChain,
          supportedChains: [monadTestnetChain],
          embeddedWallets: {
            ethereum: {
              createOnLogin: 'users-without-wallets',
            },
          },
        }}
      >
        {children}
      </PrivyProvider>
    </PrivyErrorBoundary>
  );
};

