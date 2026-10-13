import React from 'react';
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

interface PrivyAuthProviderProps {
  children: React.ReactNode;
}

export const PrivyAuthProvider: React.FC<PrivyAuthProviderProps> = ({ children }) => {
  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID || 'cm7embermonadtestnet01';

  return (
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
  );
};
