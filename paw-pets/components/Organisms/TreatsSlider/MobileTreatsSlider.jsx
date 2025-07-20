import { AnimatePresence } from "framer-motion";
import styled from "styled-components";
import ItemCard from "@/components/Atoms/ItemCard";
import Typography from "@/components/Atoms/Text";
import { useState, useContext } from "react";
import { userContext } from "@/pages";
import { GameContext } from "@/pages/_app";
import useSound from "use-sound";
import { feedKitty } from "@/util/kittyContract";
import toast from 'react-hot-toast';
import Image from "next/image";

const MobileSliderOverlay = styled.div`
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: flex-end;
`

const MobileSliderContainer = styled.div`
    background-color: var(--primary);
    border-radius: 1.5rem 1.5rem 0 0;
    border: 3px solid var(--border);
    border-bottom: none;
    width: 100%;
    max-height: 80vh;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
    overflow-y: auto;
`

const MobileSliderHeader = styled.div`
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

const MobileGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 1rem 0;
`

const MobileGridItem = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(248, 215, 168, 0.2);
    border-radius: 1rem;
    border: 2px solid var(--button-light);
`

const MobileFeedButton = styled.button`
    background: ${props => props.disabled ? '#ccc' : 'var(--secondary-accent)'};
    color: white;
    border: 3px solid ${props => props.disabled ? '#999' : 'var(--border-hard)'};
    border-radius: 0.8rem;
    padding: 0.6rem 1rem;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s ease;
    width: 100%;
    
    &:hover:not(:disabled) {
        background: var(--border-hard);
        transform: translateY(-2px);
    }
`

const MobileNavigation = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-top: 2px solid var(--button-light);
`

const MobileNavButton = styled.button`
    background: var(--button-light);
    border: 3px solid var(--button-medium);
    border-radius: 1rem;
    padding: 0.8rem 1.5rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background: var(--button-medium);
        transform: translateY(-2px);
    }
    
    &:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
    }
`

export default function MobileTreatsSlider({
    active,
    onExit = () => { },
    onTreatClick = (treat) => { return treat }
}) {
    const { currentTreats, setCurrentTreats, selectedKitty } = useContext(userContext);
    const [pageLimit, setPageLimit] = useState(6)
    const [pageMin, setPageMin] = useState(0)
    const [currentPage, setCurrentPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const [feedLoading, setFeedLoading] = useState(false);
    const [feedMsg, setFeedMsg] = useState("");
    const isHungry = selectedKitty?.stats?.hunger < 40;
    const { Volume } = useContext(GameContext);
    const [sound] = useSound('/sound/bamboohit.mp3', { volume: Volume, });

    // Add debugging
    console.log('MobileTreatsSlider render:', { active, currentTreats: currentTreats?.length });

    const handleClose = () => {
        console.log('MobileTreatsSlider close button clicked');
        sound();
        onExit();
    };

    return (
        <AnimatePresence>
            {active && (
                <MobileSliderOverlay
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                >
                    <MobileSliderContainer
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <MobileSliderHeader>
                            <Typography
                                text="Your Treats"
                                weight="600"
                                size="1.5rem"
                                color="var(--secondary-accent)"
                            />
                            <MobileCloseButton onClick={handleClose}>
                                <Image src="/icons/exit.svg" width={20} height={20} alt="Close" />
                            </MobileCloseButton>
                        </MobileSliderHeader>

                        <MobileGrid>
                            {currentTreats && currentTreats.slice(pageMin, pageLimit).map((item, i) => (
                                <MobileGridItem key={i}>
                                    <ItemCard image={item.image} alt="MEOW MEOW" />
                                    <Typography 
                                        text={`x${item.count ? item.count : 0}`} 
                                        weight="400" 
                                        size="0.9rem" 
                                    />
                                    <Typography 
                                        text={item.name} 
                                        weight="500" 
                                        size="1.1rem" 
                                    />
                                    <MobileFeedButton
                                        disabled={!isHungry || item.count < 1 || feedLoading}
                                        onClick={async () => {
                                            if (!selectedKitty) return;
                                            setFeedMsg("");
                                            setFeedLoading(true);
                                            try {
                                                await feedKitty(selectedKitty.id);
                                                setFeedMsg('You fed your kitty! 😺');
                                                toast.success('You fed your kitty! 😺');
                                                // Decrement treat count
                                                const updatedTreats = [...currentTreats];
                                                updatedTreats[i].count -= 1;
                                                setCurrentTreats(updatedTreats);
                                            } catch (e) {
                                                setFeedMsg('Something went wrong. Try again!');
                                                toast.error('Something went wrong. Try again!');
                                            }
                                            setFeedLoading(false);
                                        }}
                                    >
                                        {feedLoading ? 'Feeding...' : 'Feed Kitty'}
                                    </MobileFeedButton>
                                    {feedMsg && (
                                        <Typography
                                            text={feedMsg}
                                            weight="500"
                                            size="0.8rem"
                                            color="var(--secondary-accent)"
                                            align="center"
                                        />
                                    )}
                                </MobileGridItem>
                            ))}
                        </MobileGrid>

                        <MobileNavigation>
                            <MobileNavButton
                                disabled={currentPage <= 1}
                                onClick={() => {
                                    if (currentPage > 1) {
                                        setCurrentPage(currentPage - 1);
                                        setPageMin(pageMin - 6);
                                        setPageLimit(pageLimit - 6);
                                    }
                                }}
                            >
                                Previous
                            </MobileNavButton>
                            
                            <Typography
                                text={`Page ${currentPage} of ${maxPage}`}
                                weight="500"
                                size="1rem"
                                color="var(--black)"
                            />
                            
                            <MobileNavButton
                                disabled={currentPage >= maxPage}
                                onClick={() => {
                                    if (currentPage < maxPage) {
                                        setCurrentPage(currentPage + 1);
                                        setPageMin(pageMin + 6);
                                        setPageLimit(pageLimit + 6);
                                    }
                                }}
                            >
                                Next
                            </MobileNavButton>
                        </MobileNavigation>
                    </MobileSliderContainer>
                </MobileSliderOverlay>
            )}
        </AnimatePresence>
    )
} 