import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../Button';
import Typography from '../Text';
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';

const WalletContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #F48989 0%, #F48989 100%);
  padding: 2rem;
`;

const WalletCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

const WalletInfo = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 10px;
  border: 1px solid rgba(102, 126, 234, 0.3);
`;

const AddressText = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  word-break: break-all;
  color: #333;
`;

const ConnectButton = styled(Button)`
  margin: 1rem 0;
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: 15px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const DisconnectButton = styled(Button)`
  margin: 1rem 0;
  width: 100%;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: 15px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

export default function WalletConnect({ onConnect, onDisconnect, isConnected, account }) {
  const { address, isConnected: wagmiConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useAppKit();
  const [isLoading, setIsLoading] = useState(false);

  // Sync Wagmi state with parent component
  useEffect(() => {
    if (wagmiConnected && address && !isConnected) {
      onConnect(address);
    } else if (!wagmiConnected && isConnected) {
      onDisconnect();
    }
  }, [wagmiConnected, address, isConnected, onConnect, onDisconnect]);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      disconnect();
      await onDisconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && account) {
    return (
      <WalletContainer>
        <WalletCard>
          <Typography 
            text="Wallet Connected!" 
            size="2rem" 
            weight="700" 
            color="var(--button-medium)"
          />
          <WalletInfo>
            <Typography 
              text="Connected Address:" 
              size="1rem" 
              weight="600" 
              color="var(--black)"
            />
            <AddressText>{shortenAddress(account)}</AddressText>
          </WalletInfo>
          <DisconnectButton
            text={isLoading ? "Disconnecting..." : "Disconnect Wallet"}
            onClick={handleDisconnect}
            disabled={isLoading}
            color="var(--button-red)"
            colorhover="var(--border-hard)"
            border="4px solid var(--border-hard)"
            borderradius="15px"
            padding="1rem 2rem"
          />
        </WalletCard>
      </WalletContainer>
    );
  }

  return (
    <WalletContainer>
      <WalletCard>
        <Typography 
          text="Welcome to Paw Pets" 
          size="2rem" 
          weight="700" 
          color="var(--button-medium)"
        />
        <Typography 
          text="Connect your wallet to start your cat adventure!" 
          size="1.1rem" 
          weight="400" 
          color="var(--black)"
          style={{ marginBottom: '2rem' }}
        />
        <ConnectButton
          text={isLoading ? "Connecting..." : "Connect Wallet"}
          onClick={handleConnect}
          disabled={isLoading}
          color="var(--button-medium)"
          colorhover="var(--border-hard)"
          border="4px solid var(--button-medium)"
          borderradius="15px"
          padding="1rem 2rem"
        />
        <Typography 
          text="Note: Please ensure you're connected to Base Sepolia network." 
          size="0.9rem" 
          weight="400" 
          color="var(--button-medium)"
          style={{ marginTop: '1rem' }}
        />
      </WalletCard>
    </WalletContainer>
  );
} 