import styled from "styled-components";
import Typography from "@/components/Atoms/Text";
import Button from "@/components/Atoms/Button";
import { useState, useContext } from "react";
import { AnimatePresence } from "framer-motion";
import { GameContext } from "@/pages/_app";
import { userContext } from "@/pages";
import Image from "next/image";

const MobilePopupOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
`

const MobilePopupContainer = styled.div`
    background-color: var(--primary);
    border-radius: 1.5rem;
    border: 3px solid var(--border);
    border-bottom: 8px solid var(--border);
    width: 100%;
    max-width: 320px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: relative;
`

const MobileHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 2px solid var(--button-light);
`

const MobileCloseButton = styled.button`
    background: var(--border-light);
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background: var(--border-hard);
    }
`

const MobileSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`

const MobileSettingRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: rgba(248, 215, 168, 0.3);
    border-radius: 1rem;
    border: 2px solid var(--button-light);
`

const MobileWalletDisplay = styled.div`
    background: rgba(248, 215, 168, 0.4);
    padding: 1rem;
    border-radius: 1rem;
    text-align: center;
    border: 2px solid var(--button-medium);
`

const MobileButton = styled.button`
    background: ${props => props.variant === 'danger' ? 'var(--button-red)' : 'var(--button-light)'};
    color: white;
    border: 3px solid ${props => props.variant === 'danger' ? 'var(--border-hard)' : 'var(--button-medium)'};
    border-radius: 1rem;
    padding: 0.8rem 1.5rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    
    &:hover {
        background: ${props => props.variant === 'danger' ? 'var(--border-hard)' : 'var(--button-medium)'};
        transform: translateY(-2px);
    }
    
    &:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
    }
`

const MobileToggleButton = styled.button`
    background: ${props => props.active ? 'var(--button-red)' : 'var(--button-light)'};
    color: white;
    border: 3px solid ${props => props.active ? 'var(--border-hard)' : 'var(--button-medium)'};
    border-radius: 1rem;
    padding: 0.5rem 1rem;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background: ${props => props.active ? 'var(--border-hard)' : 'var(--button-medium)'};
    }
`

export default function MobileSettingsPopup({
    active,
    onExit = () => { }
}) {
    const { Volume, setVolume, BGMVolume, setBGMVolume } = useContext(GameContext)
    const { bgm, bgmController, currentUser, onDisconnect } = useContext(userContext)

    const handleDisconnect = async () => {
        try {
            if (onDisconnect) {
                onDisconnect();
            }
            onExit();
        } catch (error) {
            console.error('Failed to disconnect wallet:', error);
            if (onDisconnect) {
                onDisconnect();
            }
            onExit();
        }
    }

    const shortenAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <AnimatePresence>
            {active && (
                <MobilePopupOverlay
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onExit}
                >
                <MobilePopupContainer
                    initial={{ scale: 0.8, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.8, y: 50 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <MobileHeader>
                        <Typography
                            text="Settings"
                            weight="600"
                            size="1.5rem"
                            color="var(--secondary-accent)"
                        />
                        <MobileCloseButton onClick={onExit}>
                            <Image src="/icons/exit.svg" width={20} height={20} alt="Close" />
                        </MobileCloseButton>
                    </MobileHeader>

                    <MobileSection>
                        <Typography
                            text="Audio Settings"
                            weight="600"
                            size="1.2rem"
                            color="var(--black)"
                        />
                        
                        <MobileSettingRow>
                            <div>
                                <Typography
                                    text="Background Music"
                                    weight="500"
                                    size="1rem"
                                    color="var(--black)"
                                />
                            </div>
                            <MobileToggleButton
                                active={BGMVolume > 0}
                                onClick={() => {
                                    if (BGMVolume > 0) {
                                        setBGMVolume(0);
                                        bgmController.stop();
                                    } else {
                                        setBGMVolume(0.2);
                                        bgm();
                                    }
                                }}
                            >
                                {BGMVolume > 0 ? 'MUTE' : 'UNMUTE'}
                            </MobileToggleButton>
                        </MobileSettingRow>

                        <MobileSettingRow>
                            <div>
                                <Typography
                                    text="Sound Effects"
                                    weight="500"
                                    size="1rem"
                                    color="var(--black)"
                                />
                            </div>
                            <MobileToggleButton
                                active={Volume > 0}
                                onClick={() => {
                                    setVolume(Volume > 0 ? 0 : 0.5);
                                }}
                            >
                                {Volume > 0 ? 'MUTE' : 'UNMUTE'}
                            </MobileToggleButton>
                        </MobileSettingRow>
                    </MobileSection>

                    <MobileSection>
                        <Typography
                            text="Wallet"
                            weight="600"
                            size="1.2rem"
                            color="var(--black)"
                        />
                        
                        <MobileWalletDisplay>
                            <Typography
                                text={shortenAddress(currentUser?.address)}
                                weight="500"
                                size="1rem"
                                color="var(--button-medium)"
                                align="center"
                            />
                        </MobileWalletDisplay>
                    </MobileSection>

                    <MobileSection>
                        {currentUser && (
                            <MobileButton
                                variant="danger"
                                onClick={handleDisconnect}
                            >
                                DISCONNECT WALLET
                            </MobileButton>
                        )}
                    </MobileSection>
                </MobilePopupContainer>
            </MobilePopupOverlay>
            )}
        </AnimatePresence>
    )
} 