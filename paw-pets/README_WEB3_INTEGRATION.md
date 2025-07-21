# Paw Pets - Web3 Integration with Base Sepolia

This document explains the Web3 integration setup for Paw Pets using Reown AppKit and Base Sepolia.

## 🚀 New Web3 Stack

### Reown AppKit Integration
- **Provider**: Reown AppKit for modern Web3 wallet management
- **Network**: Base Sepolia testnet
- **Contract**: Deployed at `0x503320Ec0664fd8bf4ADca4Eff2d5C8E7A0aBB46`
- **Framework**: Wagmi v2 + Viem v2

## 📦 Dependencies

```json
{
  "@reown/appkit": "^1.7.10",
  "@reown/appkit-adapter-wagmi": "^1.7.10",
  "@tanstack/react-query": "^5.81.2",
  "viem": "^2.31.4",
  "wagmi": "^2.15.6"
}
```

## 🔧 Configuration

### Web3 Configuration (`util/web3Config.js`)
- Contract address and ABI
- Reown AppKit setup with Base Sepolia
- Project ID: `6577096a73d74c214d3434d5a85174fd`
- App metadata configuration

### Contract Integration (`util/kittyContract.js`)
- Wagmi v2 hooks for contract interactions
- Read and write contract functions
- Legacy function compatibility

## 🎮 Features

### Wallet Connection
- Modern wallet connection via Reown AppKit
- Support for MetaMask, WalletConnect, and other wallets
- Automatic network switching to Base Sepolia

### Contract Functions
- **Kitty Management**: Create, feed, play, sleep, clean
- **Accessories**: Add accessories with ETH payments
- **View Functions**: Get kitty stats, progress, accessories
- **Treasury**: View balance and manage funds

### Hooks Available
```javascript
// Write functions
useCreateKitty()
useFeedKitty()
usePlayWithKitty()
useSleepKitty()
useCleanKitty()
useAddAccessoryWithPayment()
useAddAccessory()

// Read functions
useGetKittyOwner(kittyId)
useGetOwnerKitties(owner)
useGetKittyStats(kittyId)
useGetKittyProgress(kittyId)
useGetKittyAccessories(kittyId)
useGetKittyName(kittyId)
useGetKittyStage(kittyId)
useGetKittyMood(kittyId)
useGetTotalKitties()
useGetNextKittyId()
useGetTreasuryBalance()
useGetAccessoryPrice(category)
useGetAllAccessoryPrices()
useIsDeployer(account)
useGetTime()
```

## 🛠️ Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_REOWN_PROJECT_ID=6577096a73d74c214d3434d5a85174fd
NEXT_PUBLIC_CONTRACT_ADDRESS=0x503320Ec0664fd8bf4ADca4Eff2d5C8E7A0aBB46
```

### 3. Run Development Server
```bash
npm run dev
```

## 🔗 Network Information

### Base Sepolia
- **Chain ID**: 84532
- **RPC URL**: https://sepolia.base.org
- **Explorer**: https://sepolia.basescan.org
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

## 💰 Getting Test ETH

1. Visit the Base Sepolia faucet
2. Connect your wallet
3. Request test ETH
4. Switch your wallet to Base Sepolia network

## 🎯 Usage Examples

### Creating a Kitty
```javascript
const { createKitty, isPending } = useCreateKitty();

const handleCreateKitty = async () => {
  try {
    await createKitty("Fluffy");
    console.log("Kitty created successfully!");
  } catch (error) {
    console.error("Failed to create kitty:", error);
  }
};
```

### Feeding a Kitty
```javascript
const { feedKitty, isPending } = useFeedKitty();

const handleFeedKitty = async (kittyId) => {
  try {
    await feedKitty(kittyId);
    console.log("Kitty fed successfully!");
  } catch (error) {
    console.error("Failed to feed kitty:", error);
  }
};
```

### Getting Kitty Stats
```javascript
const { data: stats, isLoading, isError } = useGetKittyStats(kittyId);

if (isLoading) return <div>Loading...</div>;
if (isError) return <div>Error loading stats</div>;

console.log("Kitty stats:", stats);
// { hunger: 80, energy: 100, happiness: 90, health: 100, cleanliness: 80 }
```

## 🔄 Migration from Aptos

### Key Changes
1. **Wallet**: Petra → Reown AppKit (supports multiple wallets)
2. **Network**: Aptos Testnet → Base Sepolia
3. **Currency**: APT → ETH
4. **Framework**: Aptos SDK → Wagmi v2 + Viem v2

### Contract Functions Mapping
| Aptos Function | Base Sepolia Function |
|----------------|----------------------|
| `create_kitty` | `createKitty` |
| `feed_kitty` | `feedKitty` |
| `play_with_kitty` | `playWithKitty` |
| `sleep_kitty` | `sleepKitty` |
| `clean_kitty` | `cleanKitty` |
| `add_accessory_with_payment` | `addAccessoryWithPayment` |

## 🐛 Troubleshooting

### Common Issues

1. **Wallet Not Connecting**
   - Ensure wallet supports Base Sepolia
   - Check if wallet is unlocked
   - Try refreshing the page

2. **Transaction Fails**
   - Check if you have enough ETH for gas
   - Ensure you're on Base Sepolia network
   - Check contract address is correct

3. **Network Issues**
   - Switch to Base Sepolia in your wallet
   - Add Base Sepolia network if not available
   - Check RPC endpoint connectivity

### Debug Information
- Contract Address: `0x503320Ec0664fd8bf4ADca4Eff2d5C8E7A0aBB46`
- Network: Base Sepolia (Chain ID: 84532)
- Project ID: `6577096a73d74c214d3434d5a85174fd`

## 📚 Resources

- [Reown AppKit Documentation](https://docs.reown.com)
- [Base Sepolia Documentation](https://docs.base.org)
- [Wagmi Documentation](https://wagmi.sh)
- [Viem Documentation](https://viem.sh)

## 🎉 Next Steps

1. Test all contract functions
2. Add error handling and loading states
3. Implement transaction notifications
4. Add network switching UI
5. Optimize for mobile wallets 