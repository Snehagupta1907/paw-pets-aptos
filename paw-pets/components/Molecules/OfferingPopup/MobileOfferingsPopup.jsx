import { AnimatePresence } from "framer-motion";
import styled from "styled-components";
import Typography from "@/components/Atoms/Text";
import { useState, useContext } from "react";
import { userContext } from "@/pages";
import { GameContext } from "@/pages/_app";
import useSound from "use-sound";
import { playWithKitty } from '@/util/kittyContract';
import toast from 'react-hot-toast';
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
    max-width: 350px;
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

const MobileContent = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`

const MobileWarning = styled.div`
    background: rgba(255, 0, 0, 0.1);
    border: 2px solid var(--button-red);
    border-radius: 1rem;
    padding: 1rem;
    color: var(--button-red);
    font-weight: 600;
    font-size: 1.1rem;
    text-align: center;
`

const MobileTreatsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`

const MobileTreatsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
`

const MobileTreatCard = styled.div`
    border: 2px solid var(--border-hard);
    border-radius: 1rem;
    padding: 0.8rem;
    background: white;
    text-align: center;
    font-size: 0.9rem;
`

const MobilePlayButton = styled.button`
    background: ${props => props.disabled ? 'var(--border-hard)' : 'var(--secondary-accent)'};
    color: white;
    border: 3px solid ${props => props.disabled ? '#999' : 'var(--border-hard)'};
    border-radius: 1rem;
    padding: 1rem 2rem;
    font-weight: 600;
    font-size: 1.2rem;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s ease;
    width: 100%;
    
    &:hover:not(:disabled) {
        background: var(--border-hard);
        transform: translateY(-2px);
    }
`

const MobileMessage = styled.div`
    color: var(--secondary-accent);
    font-weight: 500;
    text-align: center;
    font-size: 1rem;
`

export default function MobileOfferingsPopup({
    active,
    onExit = () => { }
}) {
    const { selectedKitty, setIsPlaying, isPlaying, currentTreats, setCurrentTreats } = useContext(userContext);
    const [playMsg, setPlayMsg] = useState("");
    const isHungry = selectedKitty?.stats?.hunger < 40;
    const { Volume } = useContext(GameContext);
    const [sound] = useSound('/sound/meow1.mp3', { volume: Volume, });

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
                                text="Offerings"
                                weight="600"
                                size="1.5rem"
                                color="var(--secondary-accent)"
                            />
                            <MobileCloseButton onClick={onExit}>
                                <Image src="/icons/exit.svg" width={20} height={20} alt="Close" />
                            </MobileCloseButton>
                        </MobileHeader>

                        <MobileContent>
                            {isHungry && (
                                <MobileWarning>
                                    Your kitty is hungry! Please feed it before doing anything else.
                                </MobileWarning>
                            )}

                            {isHungry && (
                                <MobileTreatsSection>
                                    <Typography
                                        text="Your Treats"
                                        weight="600"
                                        size="1.2rem"
                                        color="var(--secondary-accent)"
                                    />
                                    <MobileTreatsGrid>
                                        {currentTreats?.map((treat, i) => (
                                            <MobileTreatCard key={i}>
                                                <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>
                                                    {treat.name}
                                                </div>
                                                <div style={{ color: 'var(--secondary-accent)', fontSize: '0.9rem' }}>
                                                    x{treat.count}
                                                </div>
                                            </MobileTreatCard>
                                        ))}
                                    </MobileTreatsGrid>
                                </MobileTreatsSection>
                            )}

                            <div style={{ textAlign: 'center' }}>
                                <Typography
                                    text="Play with Kitty"
                                    weight="600"
                                    size="1.3rem"
                                    color="var(--secondary-accent)"
                                />
                                
                                <MobilePlayButton
                                    disabled={isHungry || isPlaying}
                                    onClick={async () => {
                                        if (!selectedKitty) return;
                                        setPlayMsg("");
                                        setIsPlaying(true);
                                        try {
                                            await playWithKitty(selectedKitty.id);
                                            setPlayMsg('You played with your kitty! 😺');
                                            toast.success('You played with your kitty! 😺');
                                            sound();
                                        } catch (e) {
                                            setPlayMsg('Something went wrong. Try again!');
                                            toast.error('Something went wrong. Try again!');
                                        }
                                        setIsPlaying(false);
                                    }}
                                >
                                    {isPlaying ? 'Playing...' : 'Play with Kitty'}
                                </MobilePlayButton>
                                
                                {playMsg && (
                                    <MobileMessage>
                                        {playMsg}
                                    </MobileMessage>
                                )}
                            </div>
                        </MobileContent>
                    </MobilePopupContainer>
                </MobilePopupOverlay>
            )}
        </AnimatePresence>
    )
} 