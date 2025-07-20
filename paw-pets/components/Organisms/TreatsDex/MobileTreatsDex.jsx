import { AnimatePresence } from "framer-motion";
import styled from "styled-components";
import Typography from "@/components/Atoms/Text";
import { useState, useContext } from "react";
import { userContext } from "@/pages";
import { GameContext } from "@/pages/_app";
import useSound from "use-sound";
import toast from 'react-hot-toast';
import Image from "next/image";
import Treats from "@/data/treats.json";
import Ingredients from "@/data/ingredients.json";

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

const MobileGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 1rem 0;
    flex: 1;
    min-height: 0;
`

const MobileFoodCard = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
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

const MobileFoodImage = styled.div`
    width: 80px;
    height: 80px;
    border-radius: 0.5rem;
    overflow: hidden;
    border: 2px solid var(--button-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--white);
`

const MobileIngredientsRow = styled.div`
    display: flex;
    gap: 0.5rem;
    align-items: center;
`

const MobileIngredientImage = styled.div`
    width: 30px;
    height: 30px;
    border-radius: 50%;
    overflow: hidden;
    border: 1px solid var(--button-medium);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--white);
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

const MobileCookPrompt = styled.div`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--primary);
    border-radius: 1.5rem;
    border: 3px solid var(--border);
    border-bottom: 8px solid var(--border);
    padding: 2rem;
    max-width: 300px;
    width: 90%;
    text-align: center;
    z-index: 1001;
`

const MobileCookButton = styled.button`
    background: var(--secondary-accent);
    color: white;
    border: 3px solid var(--border-hard);
    border-radius: 0.8rem;
    padding: 0.8rem 1.5rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    margin: 0.5rem;
    
    &:hover {
        background: var(--border-hard);
        transform: translateY(-2px);
    }
    
    &:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
    }
`

export default function MobileTreatsDex({
    active,
    onExit = () => { }
}) {
    const [pageLimit, setPageLimit] = useState(4);
    const [pageMin, setPageMin] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [activePop, setActivePop] = useState(false);
    const [treat, setTreat] = useState("");
    const [cooked, setCooked] = useState(false);
    const [popText, setPopText] = useState("");
    const { currentOfferings, setCurrentOfferings, setCurrentTreats, currentTreats = [], fetchTreats, fetchOfferings } = useContext(userContext);
    const { Volume } = useContext(GameContext);
    const [loading, setLoading] = useState(false);

    const [sound] = useSound('/sound/bamboohit.mp3', { volume: Volume, });

    const cookTreat = async (treat) => {
        const safeTreats = currentTreats || [];
        setPopText(`cooking...`);
        setLoading(true);
        setTimeout(() => {
            const ing1Obj = Ingredients[treat.ing1];
            const ing2Obj = Ingredients[treat.ing2];
            const ing1OfferingIndex = currentOfferings.findIndex(o => o.id === ing1Obj.id);
            const ing2OfferingIndex = currentOfferings.findIndex(o => o.id === ing2Obj.id);
            const ing1Available = ing1OfferingIndex !== -1 && currentOfferings[ing1OfferingIndex].count > 0;
            const ing2Available = ing2OfferingIndex !== -1 && currentOfferings[ing2OfferingIndex].count > 0;
            
            if (!ing1Available) {
                setPopText(`Missing x1 ${ing1Obj ? ing1Obj.name : 'ingredient'}`);
                setCooked(true);
                setLoading(false);
                return;
            } else if (!ing2Available) {
                setPopText(`Missing x1 ${ing2Obj ? ing2Obj.name : 'ingredient'}`);
                setCooked(true);
                setLoading(false);
                return;
            } else {
                setTimeout(() => {
                    setCooked(true);
                    setPopText(`${treat.name} acquired!`);
                    
                    const updatedOfferings = currentOfferings.map((offering) => {
                        if (offering.id === ing1Obj.id || offering.id === ing2Obj.id) {
                            return { ...offering, count: Math.max(0, offering.count - 1) };
                        }
                        return offering;
                    });
                    setCurrentOfferings(updatedOfferings);
                    localStorage.setItem('ingredients', JSON.stringify(updatedOfferings));
                    
                    const treatIndex = safeTreats.findIndex(t => t.id === treat.id);
                    let updatedTreats;
                    if (treatIndex !== -1) {
                        updatedTreats = safeTreats.map((t, idx) => idx === treatIndex ? { ...t, count: (t.count || 0) + 1 } : t);
                    } else {
                        updatedTreats = [...safeTreats, { ...treat, count: 1 }];
                    }
                    setCurrentTreats(updatedTreats);
                    localStorage.setItem('treats', JSON.stringify(updatedTreats));
                    setLoading(false);
                }, 3000 + Math.floor(Math.random() * 1000));
            }
        }, 500);
    };

    if (!active) {
        return null;
    }

    const displayTreats = Treats.slice(pageMin, pageLimit);
    
    return (
        <>
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
                                    text="Cook Treats"
                                    weight="600"
                                    size="1.5rem"
                                    color="var(--secondary-accent)"
                                />
                                <MobileCloseButton onClick={onExit}>
                                    <Image src="/icons/exit.svg" width={20} height={20} alt="Close" />
                                </MobileCloseButton>
                            </MobileHeader>

                            <MobileGrid>
                                {displayTreats.map((treat, id) => (
                                    <MobileFoodCard 
                                        key={id} 
                                        onClick={() => { 
                                            setActivePop(true); 
                                            setTreat(treat); 
                                            setCooked(false); 
                                        }}
                                    >
                                        <MobileFoodImage>
                                            <Image 
                                                src={treat.image} 
                                                alt={treat.name}
                                                width={80}
                                                height={80}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </MobileFoodImage>
                                        <Typography 
                                            text={treat.name} 
                                            weight="600" 
                                            size="1rem" 
                                        />
                                        <MobileIngredientsRow>
                                            <MobileIngredientImage>
                                                <Image 
                                                    src={Ingredients[treat.ing1].image} 
                                                    alt={Ingredients[treat.ing1].name}
                                                    width={30}
                                                    height={30}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            </MobileIngredientImage>
                                            <Typography text="+" weight="600" size="0.8rem" />
                                            <MobileIngredientImage>
                                                <Image 
                                                    src={Ingredients[treat.ing2].image} 
                                                    alt={Ingredients[treat.ing2].name}
                                                    width={30}
                                                    height={30}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            </MobileIngredientImage>
                                        </MobileIngredientsRow>
                                    </MobileFoodCard>
                                ))}
                            </MobileGrid>

                            {Treats.length > 4 && (
                                <MobileNavigation>
                                    <MobileNavButton
                                        disabled={currentPage <= 1}
                                        onClick={() => {
                                            if (currentPage > 1) {
                                                setCurrentPage(currentPage - 1);
                                                setPageMin(pageMin - 4);
                                                setPageLimit(pageLimit - 4);
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
                                        disabled={pageLimit >= Treats.length}
                                        onClick={() => {
                                            if (pageLimit < Treats.length) {
                                                setCurrentPage(currentPage + 1);
                                                setPageMin(pageMin + 4);
                                                setPageLimit(pageLimit + 4);
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

            <AnimatePresence>
                {activePop && (
                    <MobilePopupOverlay
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setActivePop(false)}
                    >
                        <MobileCookPrompt
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {loading ? (
                                <>
                                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                        <span role="img" aria-label="cooking" style={{ fontSize: '3rem' }}>🍳</span>
                                        <Typography text="Cooking..." weight="600" size="1.2rem" />
                                    </div>
                                    <Typography text="Your treat is being cooked!" weight="500" size="1rem" />
                                    <MobileCookButton disabled>COOKING...</MobileCookButton>
                                </>
                            ) : cooked ? (
                                <>
                                    <Typography text={popText} weight="600" size="1.2rem" />
                                    <MobileCookButton onClick={() => setActivePop(false)}>
                                        OKAY
                                    </MobileCookButton>
                                </>
                            ) : (
                                <>
                                    <Typography text={`Cook a ${treat.name}?`} weight="600" size="1.2rem" />
                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                                        <MobileCookButton onClick={() => setActivePop(false)}>
                                            NO
                                        </MobileCookButton>
                                        <MobileCookButton onClick={() => cookTreat(treat)}>
                                            YES
                                        </MobileCookButton>
                                    </div>
                                </>
                            )}
                        </MobileCookPrompt>
                    </MobilePopupOverlay>
                )}
            </AnimatePresence>
        </>
    );
} 