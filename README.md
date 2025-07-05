# Cross-Chain Arbitrage Frontend

A modern, React-based frontend application for cross-chain arbitrage trading with wallet connectivity. Built with a Scaffold-ETH-like architecture for optimal DeFi trading experience.

## 🚀 Features

- **Wallet Integration**: Connect with MetaMask, WalletConnect, and other popular wallets
- **Cross-Chain Support**: Trade on Ethereum, Polygon, Arbitrum, and Optimism
- **Portfolio Tracking**: Monitor your holdings and transaction history
- **Arbitrage Detection**: Identify and execute profitable cross-chain opportunities
- **Responsive Design**: Modern UI that works on desktop and mobile
- **Settings Management**: Customize trading parameters and security preferences
- **Simulated Trading**: Demo mode with realistic trading simulation

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Wallet**: Wagmi + RainbowKit
- **State Management**: Zustand + React Query
- **UI Components**: Lucide React Icons
- **Notifications**: React Hot Toast

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd cross_chain_arbitrage
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables (optional)**
   Create a `.env.local` file in the root directory:
   ```env
   VITE_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### WalletConnect Setup (Optional)

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a project and get your project ID
3. Add the project ID to your `.env.local` file

### Supported Networks

The application supports the following networks:
- **Ethereum Mainnet** (Chain ID: 1)
- **Polygon** (Chain ID: 137)
- **Arbitrum One** (Chain ID: 42161)
- **Optimism** (Chain ID: 10)

## 📱 Usage

### Connecting Your Wallet

1. Click the "Connect Wallet" button in the top-right corner
2. Choose your preferred wallet (MetaMask, WalletConnect, etc.)
3. Approve the connection in your wallet

### Making Trades

1. Navigate to the "Arbitrage" page
2. Select your source and destination tokens
3. Enter the amount you want to trade
4. Click "Get Quote" to see estimated rates
5. Review the quote and gas estimates
6. Click "Execute Swap" to complete the transaction

### Monitoring Portfolio

1. Go to the "Portfolio" page to view your holdings
2. Check recent transactions and performance metrics
3. Export your trading data if needed

### Configuring Settings

1. Visit the "Settings" page
2. Adjust trading parameters (slippage, gas limits, etc.)
3. Set up security preferences
4. Configure notification settings

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with navigation
│   └── ui/             # Base UI components
├── pages/              # Application pages
│   ├── Dashboard.tsx
│   ├── Arbitrage.tsx
│   ├── Portfolio.tsx
│   └── Settings.tsx
├── App.tsx             # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles
```

## 🔒 Security Features

- **Transaction Confirmation**: Optional confirmation for all trades
- **Slippage Protection**: Configurable slippage tolerance
- **Gas Limit Controls**: Prevent excessive gas usage
- **Address Whitelisting**: Restrict trading to trusted addresses
- **Maximum Transaction Limits**: Set caps on trade sizes

## 🚨 Important Notes

### Demo Mode
This application currently runs in demo mode with simulated trading functionality. All trades and quotes are simulated for demonstration purposes.

### Risk Disclaimer
- This is experimental software for educational purposes
- Always test with small amounts first
- Cross-chain arbitrage involves significant risks
- Gas costs and slippage can eat into profits
- Market conditions change rapidly

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
```

### Adding New Features

1. **New Pages**: Add components to `src/pages/`
2. **New Components**: Add reusable components to `src/components/`
3. **Styling**: Use Tailwind CSS classes or add custom styles

### Testing

```bash
# Run tests (when implemented)
npm test

# Run tests in watch mode
npm test:watch
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Scaffold-ETH](https://github.com/scaffold-eth/scaffold-eth) for the architecture inspiration
- [RainbowKit](https://rainbowkit.com/) for wallet connectivity
- [Wagmi](https://wagmi.sh/) for Ethereum hooks
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

---

**Happy Trading! 🚀**
