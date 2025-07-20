import { AnimatePresence } from "framer-motion";
import styled from "styled-components";
import Typography from "@/components/Atoms/Text";
import { useState, useContext, useEffect } from "react";
import { userContext } from "@/pages";
import { GameContext } from "@/pages/_app";
import useSound from "use-sound";
import { placeItem, addAccessoryWithPayment, ACCESSORY_CATEGORIES } from "@/util/kittyContract";
import toast from 'react-hot-toast';
import Image from "next/image";

console.log('MobileItemsSlider component loaded');

const categoryKeys = Object.keys(ACCESSORY_CATEGORIES);
function getRandomCategory() {
  const idx = Math.floor(Math.random() * categoryKeys.length);
  return ACCESSORY_CATEGORIES[categoryKeys[idx]].id;
}

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
    max-height: 80vh;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
    overflow-y: auto;
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

const MobileTabContainer = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
`

const MobileTab = styled.button`
    background: ${props => props.active ? 'var(--secondary-accent)' : 'var(--button-light)'};
    color: ${props => props.active ? 'white' : 'var(--black)'};
    border: 2px solid ${props => props.active ? 'var(--border-hard)' : 'var(--button-medium)'};
    border-radius: 0.8rem;
    padding: 0.6rem 1rem;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.2s ease;
    flex: 1;
    
    &:hover {
        background: ${props => props.active ? 'var(--border-hard)' : 'var(--button-medium)'};
    }
`

const MobileGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 1rem 0;
    flex: 1;
    min-height: 0;
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

const MobileItemImage = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 0.5rem;
    overflow: hidden;
    border: 2px solid var(--button-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--white);
`

const MobileAddButton = styled.button`
    background: #ffb347;
    color: #222;
    border: none;
    border-radius: 0.5rem;
    padding: 0.4rem 0.8rem;
    font-weight: 600;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    
    &:hover {
        background: #ffa500;
        transform: translateY(-1px);
    }
    
    &:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
    }
`

const MobileNavigation = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-top: 2px solid var(--button-light);
    flex-shrink: 0;
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

export default function MobileItemsSlider({
    active,
    onExit = () => { },
    onActiveClick = (item) => { return item }
}) {
    console.log('MobileItemsSlider called with:', { active, onExit: typeof onExit });

    const { currentItems, currentOfferings } = useContext(userContext);
    const [pageLimit, setPageLimit] = useState(6);
    const [pageMin, setPageMin] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [tab, setTab] = useState(true);
    const [maxPage, setMaxPage] = useState(1);

    const { Volume } = useContext(GameContext);
    const [sound] = useSound('/sound/bamboohit.mp3', { volume: Volume, });

    console.log('MobileItemsSlider rendering, active:', active);
    if (!active) {
        console.log('MobileItemsSlider not active, returning null');
        return null;
    }
    
    const currentData = tab ? currentItems : currentOfferings;
    const displayItems = currentData.slice(pageMin, pageLimit);
    
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
                            text="Your Items"
                            weight="600"
                            size="1.5rem"
                            color="var(--secondary-accent)"
                        />
                        <MobileCloseButton onClick={onExit}>
                            <Image src="/icons/exit.svg" width={20} height={20} alt="Close" />
                        </MobileCloseButton>
                    </MobileHeader>

                    <MobileTabContainer>
                        <MobileTab 
                            active={tab} 
                            onClick={() => { 
                                setTab(true); 
                                setCurrentPage(1); 
                                setPageMin(0); 
                                setPageLimit(6); 
                            }}
                        >
                            Items
                        </MobileTab>
                        <MobileTab 
                            active={!tab} 
                            onClick={() => { 
                                setTab(false); 
                                setCurrentPage(1); 
                                setPageMin(0); 
                                setPageLimit(6); 
                            }}
                        >
                            Ingredients
                        </MobileTab>
                    </MobileTabContainer>

                    <MobileGrid>
                        {displayItems.length === 0 ? (
                            <div style={{ 
                                gridColumn: '1 / -1', 
                                textAlign: 'center', 
                                padding: '2rem',
                                color: 'var(--button-medium)'
                            }}>
                                <Typography
                                    text={`No ${tab ? 'items' : 'ingredients'} found.`}
                                    weight="500"
                                    size="1rem"
                                />
                            </div>
                        ) : (
                            displayItems.map((item, i) => (
                                <MobileGridItem key={i} onClick={() => { onActiveClick(item); }}>
                                    <MobileItemImage>
                                        <Image 
                                            src={item.image} 
                                            alt={item.name}
                                            width={60}
                                            height={60}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </MobileItemImage>
                                    <Typography 
                                        text={`x${item.count ? item.count : 0}`} 
                                        weight="400" 
                                        size="0.8rem" 
                                    />
                                    <Typography 
                                        text={item.name} 
                                        weight="500" 
                                        size="1rem" 
                                    />
                                    {tab && (
                                        <MobileAddButton
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                sound();
                                                const kittyId = 0; // TODO: Get from context
                                                const randomCategory = getRandomCategory();
                                                try {
                                                    const result = await addAccessoryWithPayment(kittyId, item.name, randomCategory);
                                                    if (result.success) {
                                                        toast.success(`🎉 Accessory "${item.name}" added!`);
                                                    } else {
                                                        toast.error(`Failed: ${result.error || JSON.stringify(result)}`);
                                                    }
                                                } catch (e) {
                                                    toast.error("Exception: " + JSON.stringify(e));
                                                    console.error(e);
                                                }
                                            }}
                                        >
                                            Add Accessory
                                        </MobileAddButton>
                                    )}
                                </MobileGridItem>
                            ))
                        )}
                    </MobileGrid>

                    {currentData.length > 6 && (
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
                                text={`Page ${currentPage}`}
                                weight="500"
                                size="1rem"
                                color="var(--button-medium)"
                            />
                            <MobileNavButton
                                disabled={pageLimit >= currentData.length}
                                onClick={() => {
                                    if (pageLimit < currentData.length) {
                                        setCurrentPage(currentPage + 1);
                                        setPageMin(pageMin + 6);
                                        setPageLimit(pageLimit + 6);
                                    }
                                }}
                            >
                                Next
                            </MobileNavButton>
                        </MobileNavigation>
                    )}
                </MobilePopupContainer>
            </MobilePopupOverlay>
            )}
        </AnimatePresence>
    )
} 