import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Button from '../Button';
import Typography from '../Text';
import { useAutoConnect } from './AutoConnectProvider';

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

const WalletButton = styled(Button)`
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

const AutoConnectToggle = styled.div`
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 24px;
    
    &:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }
  }
  
  input:checked + span {
    background-color: var(--button-medium);
  }
  
  input:checked + span:before {
    transform: translateX(26px);
  }
`;

export default function WalletConnect({ onConnect, onDisconnect, isConnected, account }) {
  const [isLoading, setIsLoading] = useState(false);
  const { autoConnect, setAutoConnect, isDisconnecting, setIsDisconnecting } = useAutoConnect();
  const disconnectInProgress = useRef(false);

  // Auto-connect effect
  useEffect(() => {
    console.log('Auto-connect effect triggered:', { autoConnect, isConnected, isDisconnecting, disconnectInProgress: disconnectInProgress.current });
    
    // Don't auto-connect if we're in the middle of disconnecting
    if (disconnectInProgress.current) {
      console.log('Skipping auto-connect - disconnect in progress');
      return;
    }
    
    // If we're not connected and auto-connect is enabled, but we just disconnected, disable auto-connect
    if (autoConnect && !isConnected && !isDisconnecting) {
      console.log('Not connected but auto-connect is enabled - this might be after a disconnect');
      // Only attempt to connect if we have a valid connection state
      if (typeof window !== 'undefined' && window.petra) {
        console.log('Attempting to auto-connect...');
        connectWallet();
      }
    }
  }, [isConnected, autoConnect, isDisconnecting]);

  const connectWallet = async () => {
    // Don't connect if we're in the middle of disconnecting
    if (disconnectInProgress.current) {
      console.log('Skipping connect - disconnect in progress');
      return;
    }
    
    setIsLoading(true);
    try {
      // Check if Petra wallet is available
      if (typeof window !== 'undefined' && window.petra) {
        const response = await window.petra.connect();
        if (response && response.address) {
          onConnect(response.address);
          // Enable auto-connect after successful connection
          setAutoConnect(true);
        } else {
          throw new Error('No address received from Petra wallet');
        }
      } else {
        // If Petra is not available, show error
        throw new Error('Petra wallet is not installed. Please install Petra wallet extension.');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert(error.message || 'Failed to connect to Petra wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    console.log('WalletConnect disconnectWallet called');
    disconnectInProgress.current = true;
    setIsLoading(true);
    setIsDisconnecting(true);
    try {
      // Disable auto-connect first to prevent re-connection
      setAutoConnect(false);
      
      // Call onDisconnect which now handles both local state and Petra disconnect
      await onDisconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      // Still call onDisconnect even if there's an error
      await onDisconnect();
    } finally {
      setIsLoading(false);
      setIsDisconnecting(false);
      // Reset the ref after a delay to ensure all effects have run
      setTimeout(() => {
        disconnectInProgress.current = false;
      }, 500);
    }
  };

  const handleAutoConnectToggle = () => {
    setAutoConnect(!autoConnect);
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
          <AutoConnectToggle>
            <Typography 
              text="Auto-connect:" 
              size="0.9rem" 
              weight="500" 
              color="var(--black)"
            />
            <ToggleSwitch>
              <input 
                type="checkbox" 
                checked={autoConnect} 
                onChange={handleAutoConnectToggle}
              />
              <span></span>
            </ToggleSwitch>
          </AutoConnectToggle>
          <WalletButton
            text={isLoading ? "Disconnecting..." : "Disconnect Wallet"}
            onClick={disconnectWallet}
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
          text="Connect your Petra wallet to start your cat adventure!" 
          size="1.1rem" 
          weight="400" 
          color="var(--black)"
          style={{ marginBottom: '2rem' }}
        />
        <WalletButton
          text={isLoading ? "Connecting..." : "Connect Petra Wallet"}
          onClick={connectWallet}
          disabled={isLoading}
          color="var(--button-medium)"
          colorhover="var(--border-hard)"
          border="4px solid var(--button-medium)"
          borderradius="15px"
          padding="1rem 2rem"
        />
        <AutoConnectToggle>
          <Typography 
            text="Auto-connect:" 
            size="0.9rem" 
            weight="500" 
            color="var(--black)"
          />
          <ToggleSwitch>
            <input 
              type="checkbox" 
              checked={autoConnect} 
              onChange={handleAutoConnectToggle}
            />
            <span></span>
          </ToggleSwitch>
        </AutoConnectToggle>
        <Typography 
          text="Note: Please install Petra wallet extension if not already installed." 
          size="0.9rem" 
          weight="400" 
          color="var(--button-medium)"
          style={{ marginTop: '1rem' }}
        />
      </WalletCard>
    </WalletContainer>
  );
} 