import { AnimatePresence } from "framer-motion";
import styled from "styled-components";
import Typography from "@/components/Atoms/Text";
import { useState, useContext, useEffect } from "react";
import { userContext } from "@/pages";
import { GameContext } from "@/pages/_app";
import useSound from "use-sound";
import toast from 'react-hot-toast';
import Image from "next/image";
import { getOwnerKittiesWithData, createKitty, getCurrentAccount } from "@/util/kittyContract";

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

const MobileCreateSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
    background: rgba(248, 215, 168, 0.2);
    border-radius: 1rem;
    border: 2px solid var(--button-light);
`

const MobileInput = styled.input`
    padding: 0.8rem;
    border: 2px solid var(--button-medium);
    border-radius: 0.8rem;
    font-size: 1rem;
    background: var(--white);
    outline: none;
    
    &:focus {
        border-color: var(--secondary-accent);
    }
`

const MobileCreateButton = styled.button`
    background: var(--secondary-accent);
    color: white;
    border: 3px solid var(--border-hard);
    border-radius: 0.8rem;
    padding: 0.8rem 1.5rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover:not(:disabled) {
        background: var(--border-hard);
        transform: translateY(-2px);
    }
    
    &:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
    }
`

const MobileKittiesSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
    min-height: 0;
`

const MobileKittiesList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-height: 300px;
    overflow-y: auto;
`

const MobileKittyCard = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(248, 215, 168, 0.2);
    border-radius: 1rem;
    border: 2px solid var(--button-light);
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background: rgba(248, 215, 168, 0.4);
        transform: translateY(-2px);
    }
`

const MobileKittyImage = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--button-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--white);
    flex-shrink: 0;
`

const MobileKittyInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    flex: 1;
`

export default function MobileCatDex({
    active,
    onExit = () => { },
    selectCatCard = (id) => { return id; }
}) {
    console.log('MobileCatDex called with:', { active, onExit: typeof onExit });
    console.log('MobileCatDex - Window width:', typeof window !== 'undefined' ? window.innerWidth : 'SSR');
    
    const { cats, setCats } = useContext(userContext);
    const [userKitties, setUserKitties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [kittyName, setKittyName] = useState("");

    const { Volume } = useContext(GameContext);
    const [sound] = useSound('/sound/bamboohit.mp3', { volume: Volume, });

    useEffect(() => {
        if (active) {
            fetchUserKitties();
        }
    }, [active]);

    const fetchUserKitties = async () => {
        try {
            setLoading(true);
            const account = await getCurrentAccount();
            if (account) {
                console.log('Fetching kitties for account:', account);
                const kitties = await getOwnerKittiesWithData(account);
                console.log('Fetched kitties:', kitties);
                setUserKitties(kitties || []);
            } else {
                console.log('No account found');
                toast.error('Please connect your wallet first');
            }
        } catch (error) {
            console.error('Error fetching kitties:', error);
            if (error.message.includes('Wallet not connected')) {
                toast.error('Please connect your wallet first');
            } else if (error.message.includes('invalid type: null')) {
                toast.error('Wallet not properly connected. Please reconnect.');
            } else {
                toast.error(`Failed to fetch kitties: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const refreshKitties = async () => {
        await fetchUserKitties();
    };

    const handleCreateKitty = async () => {
        if (!kittyName.trim()) {
            toast.error('Please enter a kitty name');
            return;
        }

        try {
            setCreateLoading(true);
            const account = await getCurrentAccount();
            if (!account) {
                toast.error('Please connect your wallet first');
                return;
            }

            const result = await createKitty(kittyName.trim());
            if (result.success) {
                toast.success(`🎉 Kitty "${kittyName}" created successfully!`);
                setKittyName("");
                await refreshKitties();
            } else {
                toast.error(`Failed to create kitty: ${result.error}`);
            }
        } catch (error) {
            console.error('Error creating kitty:', error);
            toast.error('Failed to create kitty. Try again!');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleKittySelect = (kittyId) => {
        selectCatCard(kittyId);
        sound();
        onExit();
    };

    if (!active) {
        return null;
    }

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
                                text="Cat Dex"
                                weight="600"
                                size="1.5rem"
                                color="var(--secondary-accent)"
                            />
                            <MobileCloseButton onClick={onExit}>
                                <Image src="/icons/exit.svg" width={20} height={20} alt="Close" />
                            </MobileCloseButton>
                        </MobileHeader>

                        <MobileCreateSection>
                            <Typography
                                text="Create New Kitty"
                                weight="600"
                                size="1.2rem"
                                color="var(--black)"
                            />
                            <MobileInput
                                type="text"
                                placeholder="Enter kitty name..."
                                value={kittyName}
                                onChange={(e) => setKittyName(e.target.value)}
                            />
                            <MobileCreateButton
                                disabled={!kittyName.trim() || createLoading}
                                onClick={handleCreateKitty}
                            >
                                {createLoading ? 'Creating...' : 'Create Kitty'}
                            </MobileCreateButton>
                        </MobileCreateSection>

                        <MobileKittiesSection>
                            <Typography
                                text={`Your Kitties (${userKitties?.length || 0})`}
                                weight="600"
                                size="1.2rem"
                                color="var(--black)"
                            />
                            
                            <MobileKittiesList>
                                {loading ? (
                                    <Typography
                                        text="Loading kitties..."
                                        weight="500"
                                        size="1rem"
                                        color="var(--button-medium)"
                                        style={{ textAlign: 'center', padding: '1rem' }}
                                    />
                                ) : !userKitties || userKitties.length === 0 ? (
                                    <Typography
                                        text="No kitties found. Create your first kitty!"
                                        weight="500"
                                        size="1rem"
                                        color="var(--button-medium)"
                                        style={{ textAlign: 'center', padding: '1rem' }}
                                    />
                                ) : (
                                    userKitties.map((kitty, index) => {
                                        // Find matching cat data for image
                                        const matchingCat = cats?.find?.(cat => cat?.id === kitty?.id);
                                        const displayData = {
                                            ...matchingCat,
                                            count: 1,
                                            contractData: kitty
                                        };
                                        
                                        return (
                                            <MobileKittyCard
                                                key={kitty.id || index}
                                                onClick={() => handleKittySelect(kitty.id)}
                                            >
                                                <MobileKittyImage>
                                                    <Image 
                                                        src={displayData.img || displayData.catImage || `/cats/cat${(kitty.id % 16) + 1}.png`}
                                                        alt="Kitty"
                                                        width={60}
                                                        height={60}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover',
                                                            borderRadius: '50%'
                                                        }}
                                                    />
                                                </MobileKittyImage>
                                                <MobileKittyInfo>
                                                    <Typography
                                                        text={`No. ${index + 1}`}
                                                        weight="400"
                                                        size="0.8rem"
                                                        color="var(--button-medium)"
                                                    />
                                                    <Typography
                                                        text={displayData.breedName || kitty.name || `Kitty ${kitty.id || index + 1}`}
                                                        weight="600"
                                                        size="1.1rem"
                                                        color="var(--black)"
                                                    />
                                                    <Typography
                                                        text={displayData.stage?.name || kitty.stage?.name || 'Baby'}
                                                        weight="500"
                                                        size="0.9rem"
                                                        color="var(--secondary-accent)"
                                                    />
                                                    <Typography
                                                        text={displayData.mood?.name || kitty.mood?.name || 'Happy'}
                                                        weight="400"
                                                        size="0.8rem"
                                                        color="var(--button-medium)"
                                                    />
                                                </MobileKittyInfo>
                                            </MobileKittyCard>
                                        );
                                    })
                                )}
                            </MobileKittiesList>
                        </MobileKittiesSection>
                    </MobilePopupContainer>
                </MobilePopupOverlay>
            )}
        </AnimatePresence>
    );
} 