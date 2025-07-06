# 🐱 PAW PETS

A complete decentralized pet care game built on the Aptos blockchain using Move 2.0 smart contracts and a modern Next.js frontend.

## 📋 Overview

Aptos Pet is a comprehensive blockchain-based pet care game where users can:
- **Adopt and care for virtual kitties** on the Aptos blockchain
- **Interact with pets** through feeding, playing, sleeping, and cleaning
- **Collect accessories** and customize their pets
- **Earn experience** and level up their pets through care activities
- **Connect with Petra wallet** for secure, decentralized authentication

## 🏗️ Architecture

### Smart Contract (Move 2.0)
- **Contract Address**: `0x2afecf41b2f8834ce30f6c774eebcce52aea4fe932746c13e3f2c86b3b7dc975`
- **Module Name**: `kitty_game`
- **Network**: Aptos Testnet (configurable for mainnet)
- **Language**: Move 2.0 with latest Aptos Framework

### Frontend Application
- **Framework**: Next.js 13.1.2 with React 18.2.0
- **Styling**: Styled Components + CSS Modules
- **Wallet Integration**: Petra Wallet with Aptos TS SDK
- **Animations**: Framer Motion
- **Audio**: use-sound for background music and effects

## 🚀 Features

### Core Gameplay
- 🐱 **Pet Adoption**: Create unique kitties with generated DNA
- 🍽️ **Care System**: Feed, play, sleep, and clean your pets
- 📈 **Progression**: Experience-based leveling system
- 🎭 **Mood System**: Dynamic pet moods based on care actions
- 🎨 **Customization**: Accessories and visual customization

### Blockchain Features
- 🔐 **Wallet Authentication**: Secure login via Petra wallet
- 💰 **Accessory Marketplace**: Purchase accessories with APT tokens
- 🏦 **Treasury System**: Contract-managed token collection
- 📊 **On-chain Data**: All pet data stored on Aptos blockchain
- 🔄 **Real-time Updates**: Live blockchain state synchronization

### User Experience
- 🎵 **Audio System**: Background music and sound effects
- 🎮 **Interactive UI**: Smooth animations and responsive design
- 📱 **Mobile Responsive**: Works on all device sizes
- 🏆 **Leaderboards**: Community rankings and achievements

## 🛠️ Technical Stack

### Smart Contract
```toml
[package]
name = "KittyPet"
version = "1.0.0"
upgrade_policy = "compatible"

[dependencies]
AptosFramework = { git = "https://github.com/aptos-labs/aptos-core.git", subdir = "aptos-move/framework/aptos-framework/", rev = "main" }

[addresses]
kitty_pet = "0x2afecf41b2f8834ce30f6c774eebcce52aea4fe932746c13e3f2c86b3b7dc975"
```

### Frontend Dependencies
```json
{
  "@aptos-labs/ts-sdk": "^3.1.2",
  "@aptos-labs/wallet-standard": "^0.5.0",
  "next": "13.1.2",
  "react": "18.2.0",
  "framer-motion": "^8.4.2",
  "styled-components": "^5.3.6",
  "use-sound": "^4.0.1"
}
```

## 📁 Project Structure

```
aptos-pet/
├── move/                          # Move 2.0 Smart Contracts
│   ├── Move.toml                 # Contract configuration
│   ├── sources/
│   │   └── kitty_pet.move        # Main game contract
│   └── tests/
│       └── kitty_pet_tests.move  # Contract tests
├── paw-pets/                     # Next.js Frontend Application
│   ├── components/               # React components (Atomic Design)
│   │   ├── Atoms/               # Basic UI components
│   │   ├── Molecules/           # Composite components
│   │   └── Organisms/           # Complex page sections
│   ├── data/                    # JSON data files
│   ├── pages/                   # Next.js pages and API routes
│   ├── public/                  # Static assets
│   ├── styles/                  # CSS styles
│   ├── util/                    # Utility functions
│   │   └── kittyContract.js     # Blockchain interaction layer
│   └── package.json             # Frontend dependencies
└── README.md                    # This file
```

## 🚀 Getting Started

### Prerequisites

1. **Install Petra Wallet**
   - Download from [Petra Wallet](https://petra.app/)
   - Add to your browser extensions
   - Create or import a wallet

2. **Install Aptos CLI** (for contract development)
   ```bash
   curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
   ```

3. **Get Testnet APT** (for testing)
   - Visit [Aptos Faucet](https://aptoslabs.com/testnet-faucet)
   - Request test tokens for your wallet

### Smart Contract Setup

1. **Navigate to contract directory**
   ```bash
   cd move
   ```

2. **Install dependencies**
   ```bash
   aptos init --profile default
   ```

3. **Deploy contract** (if not already deployed)
   ```bash
   aptos move publish --named-addresses kitty_pet=<YOUR_ADDRESS>
   ```

4. **Initialize contract**
   ```bash
   aptos move run --function-id <YOUR_ADDRESS>::kitty_game::initialize
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd paw-pets
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment** (if needed)
   ```bash
   # Update contract address in util/kittyContract.js if deploying to different address
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open application**
   - Visit [http://localhost:3000](http://localhost:3000)
   - Connect your Petra wallet
   - Start playing!

## 🎮 How to Play

### Getting Started
1. **Connect Wallet**: Click "Connect Petra Wallet" to authenticate
2. **Create Kitty**: Use the create function to adopt your first pet
3. **Care for Pets**: Feed, play, sleep, and clean your kitties regularly
4. **Level Up**: Earn experience through care actions to level up pets
5. **Customize**: Purchase accessories to personalize your pets

### Pet Care Actions
- **Feed**: Increases hunger, energy, and happiness (+30 hunger, +10 energy, +15 happiness)
- **Play**: Increases happiness but consumes energy (+25 happiness, -15 energy, -10 hunger)
- **Sleep**: Restores energy to maximum (+100 energy)
- **Clean**: Improves cleanliness and health (+30 cleanliness, +10 health)

### Accessory System
- **Basic**: 0.1 APT (collar, tag)
- **Medium**: 0.25 APT (hat, scarf)
- **Premium**: 0.5 APT (crown, wings)
- **Legendary**: 1 APT (magic wand, halo)

## 🔧 Development

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test:e2e     # Run Playwright tests
```

#### Smart Contract
```bash
aptos move compile   # Compile contracts
aptos move test      # Run contract tests
aptos move publish   # Deploy to blockchain
```

### Testing

#### Contract Tests
```bash
cd move
aptos move test
```

#### Frontend Tests
```bash
cd paw-pets
npm run test:e2e
```

## 🌐 Deployment

### Smart Contract Deployment
1. **Set up Aptos account**
   ```bash
   aptos init --profile production
   ```

2. **Deploy to mainnet**
   ```bash
   aptos move publish --profile production --named-addresses kitty_pet=<YOUR_ADDRESS>
   ```

3. **Initialize contract**
   ```bash
   aptos move run --profile production --function-id <YOUR_ADDRESS>::kitty_game::initialize
   ```

### Frontend Deployment
1. **Build application**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel/Netlify**
   - Connect your GitHub repository
   - Configure build settings
   - Deploy automatically on push

## 🔗 Contract Functions

### Core Functions
- `initialize()` - Initialize the kitty store and treasury
- `create_kitty(name, time)` - Create a new kitty
- `feed_kitty(kitty_id, time)` - Feed a kitty
- `play_with_kitty(kitty_id, time)` - Play with a kitty
- `sleep_kitty(kitty_id, time)` - Put kitty to sleep
- `clean_kitty(kitty_id, time)` - Clean a kitty

### Accessory Functions
- `add_accessory_with_payment(kitty_id, accessory, category)` - Purchase and add accessory
- `get_accessory_price(category)` - Get accessory price
- `get_treasury_balance()` - Check treasury balance

### Query Functions
- `get_owner_kitties(owner_address)` - Get all kitties owned by address
- `get_kitty_data(kitty_id)` - Get complete kitty information
- `get_kitty_stats(kitty_id)` - Get kitty statistics

## 🛡️ Security Features

- **Access Control**: Only kitty owners can perform care actions
- **Input Validation**: Comprehensive validation for all inputs
- **Error Handling**: Detailed error codes and messages
- **Treasury Management**: Secure token collection and withdrawal
- **Wallet Integration**: Secure authentication via Petra wallet

## 🔮 Future Enhancements

- **NFT Integration**: Convert kitties to NFTs for trading
- **Breeding System**: Allow kitties to breed and create offspring
- **Marketplace**: Decentralized marketplace for accessories
- **Social Features**: Pet sharing and social interactions
- **Cross-chain**: Multi-chain compatibility
- **Mobile App**: Native mobile application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the inline code comments and Move.toml
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Join community discussions on GitHub
- **Aptos Resources**: Visit [Aptos Developer Portal](https://aptos.dev/)

## 🙏 Acknowledgments

- **Aptos Labs** for the Move language and blockchain infrastructure
- **Petra Wallet** team for wallet integration
- **Next.js** team for the amazing React framework
- **Community** contributors and testers

---

**Happy coding and pet caring! 🐾✨**
