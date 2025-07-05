# Paw Pets - Aptos Wallet Integration

A cozy cat web application with Aptos blockchain wallet integration. Connect your Petra wallet to start your cat adventure! 🐱

## About This Version

This version of Paw Pets integrates with the **Aptos blockchain** using the **Petra wallet**. Users must connect their wallet to access the game, providing a secure and decentralized authentication method.

## Features

- 🔐 **Aptos Wallet Integration** - Connect with Petra wallet
- 🐱 Interactive cat collection and management
- 🌤️ Weather integration with dynamic backgrounds
- 🎵 Background music and sound effects
- 🎮 Treat cooking system
- 📊 Leaderboard display
- 🎨 Beautiful, responsive UI with smooth animations

## Getting Started

### Prerequisites

1. **Install Petra Wallet Extension**
   - Download from [Petra Wallet](https://petra.app/)
   - Add to your browser extensions
   - Create or import a wallet

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run the Development Server**
   ```bash
   npm run dev
   ```

4. **Connect Your Wallet**
   - Open [http://localhost:3000](http://localhost:3000)
   - Click "Connect Petra Wallet"
   - Approve the connection in your wallet

## Wallet Integration

- **Authentication**: Users must connect their Petra wallet to access the game
- **User Identity**: User data is tied to their wallet address
- **Security**: No traditional login/password required
- **Disconnect**: Users can disconnect their wallet from the settings menu

## Demo Data

The app uses hardcoded demo data including:
- Sample cat collection
- Pre-populated items and treats
- Mock leaderboard entries
- Weather simulation

## Tech Stack

- **Frontend**: Next.js, React, Styled Components
- **Blockchain**: Aptos, Petra Wallet
- **Animations**: Framer Motion
- **Audio**: use-sound
- **Testing**: Playwright

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test:e2e` - Run end-to-end tests

## Project Structure

```
neko_teikoku/
├── components/          # React components (Atoms, Molecules, Organisms)
│   └── Atoms/
│       └── WalletConnect/  # Wallet connection component
├── data/               # JSON data files
├── pages/              # Next.js pages
├── public/             # Static assets (images, sounds, etc.)
├── styles/             # CSS styles
└── util/               # Utility functions
```

## Wallet Requirements

- **Petra Wallet Extension** must be installed
- **Aptos Network** connection (Mainnet or Testnet)
- **Browser Support**: Chrome, Firefox, Safari, Edge

## Future Enhancements

- On-chain cat ownership and trading
- NFT integration for rare cats
- Decentralized leaderboards
- Cross-chain compatibility

Enjoy exploring the cozy world of Paw Pets with your Aptos wallet! 🐾
