"use client";

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';

// Contract configuration
export const CONTRACT_ADDRESS = "0x503320Ec0664fd8bf4ADca4Eff2d5C8E7A0aBB46";
export const CONTRACT_ABI = [
  // Kitty Creation
  {
    "inputs": [{"internalType": "string", "name": "_name", "type": "string"}],
    "name": "createKitty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Kitty Care Actions
  {
    "inputs": [{"internalType": "uint256", "name": "_kittyId", "type": "uint256"}],
    "name": "feedKitty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_kittyId", "type": "uint256"}],
    "name": "playWithKitty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_kittyId", "type": "uint256"}],
    "name": "sleepKitty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_kittyId", "type": "uint256"}],
    "name": "cleanKitty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Accessories
  {
    "inputs": [
      {"internalType": "uint256", "name": "_kittyId", "type": "uint256"},
      {"internalType": "string", "name": "_accessory", "type": "string"},
      {"internalType": "enum KittyPet.AccessoryCategory", "name": "_category", "type": "uint8"}
    ],
    "name": "addAccessoryWithPayment",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_kittyId", "type": "uint256"},
      {"internalType": "string", "name": "_accessory", "type": "string"}
    ],
    "name": "addAccessory",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // View Functions
  {
    "inputs": [{"internalType": "uint256", "name": "_kittyId", "type": "uint256"}],
    "name": "getKittyOwner",
    "outputs": [{"internalType": "address", "name": "", "type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_owner", "type": "address"}],
    "name": "getOwnerKitties",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_kittyId", "type": "uint256"}],
    "name": "getKittyStats",
    "outputs": [
      {"internalType": "uint8", "name": "", "type": "uint8"},
      {"internalType": "uint8", "name": "", "type": "uint8"},
      {"internalType": "uint8", "name": "", "type": "uint8"},
      {"internalType": "uint8", "name": "", "type": "uint8"},
      {"internalType": "uint8", "name": "", "type": "uint8"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_kittyId", "type": "uint256"}],
    "name": "getKittyProgress",
    "outputs": [
      {"internalType": "uint256", "name": "", "type": "uint256"},
      {"internalType": "uint8", "name": "", "type": "uint8"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_kittyId", "type": "uint256"}],
    "name": "getKittyAccessories",
    "outputs": [{"internalType": "string[]", "name": "", "type": "string[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_kittyId", "type": "uint256"}],
    "name": "getKittyName",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_kittyId", "type": "uint256"}],
    "name": "getKittyStageU8",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_kittyId", "type": "uint256"}],
    "name": "getKittyMoodU8",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalKitties",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getNextKittyId",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTreasuryBalance",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint8", "name": "_category", "type": "uint8"}],
    "name": "getAccessoryPrice",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllAccessoryPrices",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_account", "type": "address"}],
    "name": "isDeployer",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTime",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "kittyId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "name", "type": "string"}
    ],
    "name": "KittyCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "kittyId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"}
    ],
    "name": "KittyFed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "kittyId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"}
    ],
    "name": "KittyPlayed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "kittyId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"}
    ],
    "name": "KittySlept",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "kittyId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"}
    ],
    "name": "KittyCleaned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "kittyId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "accessory", "type": "string"}
    ],
    "name": "AccessoryAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "owner", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "TreasuryWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "kittyId", "type": "uint256"},
      {"indexed": false, "internalType": "uint8", "name": "newLevel", "type": "uint8"},
      {"indexed": false, "internalType": "enum KittyPet.KittyStage", "name": "newStage", "type": "uint8"}
    ],
    "name": "LevelUp",
    "type": "event"
  }
];

// 0. Setup queryClient
const queryClient = new QueryClient();

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = '6577096a73d74c214d3434d5a85174fd';

// 2. Create a metadata object - optional
const metadata = {
  name: 'Paw Pets',
  description: 'Paw Pets - Virtual Pet Care Game on Base Sepolia',
  url: 'http://localhost:3000', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
};

// 3. Set the networks - focusing on Base Sepolia for now
const chains = [baseSepolia];

// 4. Create Wagmi config with Rainbow Kit
const config = getDefaultConfig({
  appName: 'Paw Pets',
  projectId,
  chains,
  ssr: true,
});

export function AppKitProvider({ children }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider chains={chains}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

// Export chains for use in components
export { chains }; 