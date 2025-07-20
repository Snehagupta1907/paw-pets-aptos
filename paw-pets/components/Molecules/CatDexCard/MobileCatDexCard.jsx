import styled from "styled-components";
import Typography from "@/components/Atoms/Text";
import { AnimatePresence } from 'framer-motion';
import Image from "next/image";
import { StrokedText } from "stroked-text";
import { getStageName, getMoodName } from "@/util/kittyContract";

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
    max-height: 85vh;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
    overflow-y: auto;
`

const MobileHeader = styled.div`
    background-color: #B4B0E3;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-radius: 1rem;
    color: white;
    margin-bottom: 1rem;
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

const MobileCatImage = styled.div`
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
`

const MobileCatInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`

const MobileInfoSection = styled.div`
    background: var(--white);
    padding: 1rem;
    border-radius: 1rem;
    border-bottom: 4px solid var(--accent);
`

const MobileStatsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    margin-top: 0.5rem;
`

const MobileStatItem = styled.div`
    background: var(--primary);
    padding: 0.5rem;
    border-radius: 0.5rem;
    text-align: center;
    border: 2px solid var(--border-hard);
`

const MobileStatValue = styled.div`
    font-size: 1rem;
    font-weight: 600;
    color: var(--secondary-accent);
`

const MobileStatLabel = styled.div`
    font-size: 0.7rem;
    color: var(--black);
    opacity: 0.8;
`

const MobileContractData = styled.div`
    background: var(--light-accent);
    padding: 1rem;
    border-radius: 1rem;
    border: 3px solid var(--border-hard);
    margin-top: 1rem;
`

export default function MobileCatDexCard({
   catData,
   show,
   onExit = () => { },
   onCatExit = () => { }
}) {
   // Check if this is a user's kitty with contract data
   const isUserKitty = catData.contractData && catData.count > 0;
   const contractData = catData.contractData;

   if (catData.id !== show) {
      return null;
   }

   return (
      <AnimatePresence>
         {show && (
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
                            text={`no. ${catData?.id?.toString().padStart(2, '0')}`}
                            weight="500"
                            size="0.9rem"
                        />
                        <div style={{ textAlign: 'center' }}>
                            <StrokedText
                                fill='var(--white)' 
                                stroke={'var(--secondary-accent)'} 
                                strokeWidth={3} 
                                style={{
                                    fontSize: '1.2rem', 
                                    fontWeight: "600"
                                }}
                            >
                                {catData?.breedName}
                            </StrokedText>
                        </div>
                        <MobileCloseButton onClick={onExit}>
                            <Image src="/icons/exit.svg" width={20} height={20} alt="Close" />
                        </MobileCloseButton>
                    </MobileHeader>

                    <MobileCatImage>
                        <Image 
                            src={`${catData?.imgThumb}`} 
                            width={200} 
                            height={200} 
                            alt="cat" 
                            style={{ 
                                borderRadius: "50%", 
                                textAlign: "center",
                                border: '3px solid var(--border-hard)'
                            }} 
                        />
                    </MobileCatImage>

                    <MobileCatInfo>
                        {/* Show Stage and Mood if available */}
                        {(catData?.stage?.name || catData?.mood?.name) && (
                            <MobileInfoSection>
                                {catData?.stage?.name && (
                                    <Typography
                                        text={`Stage: ${catData.stage.name}`}
                                        size="1rem"
                                        color="var(--secondary-accent)"
                                        weight="600"
                                    />
                                )}
                                {catData?.mood?.name && (
                                    <Typography
                                        text={`Mood: ${catData.mood.name}`}
                                        size="1rem"
                                        color="var(--secondary-accent)"
                                        weight="600"
                                    />
                                )}
                            </MobileInfoSection>
                        )}

                        <MobileInfoSection>
                            <Typography
                                text="Cat Breed"
                                size="1.1rem"
                                color="var(--secondary-accent)"
                                weight="600"
                                style={{ marginBottom: '0.5rem' }}
                            />
                            <Typography
                                text={catData?.breedName}
                                size="1rem"
                            />
                        </MobileInfoSection>

                        <MobileInfoSection>
                            <Typography
                                text="Stage"
                                size="1.1rem"
                                color="var(--secondary-accent)"
                                weight="600"
                                style={{ marginBottom: '0.5rem' }}
                            />
                            <Typography
                                text={catData?.stage?.name || "-"}
                                size="1rem"
                            />
                        </MobileInfoSection>

                        <MobileInfoSection>
                            <Typography
                                text="Description"
                                size="1.1rem"
                                color="var(--secondary-accent)"
                                weight="600"
                                style={{ marginBottom: '0.5rem' }}
                            />
                            {catData.stats ? (
                                <MobileStatsGrid>
                                    <MobileStatItem>
                                        <MobileStatValue>{catData.stats.hunger}</MobileStatValue>
                                        <MobileStatLabel>Hunger</MobileStatLabel>
                                    </MobileStatItem>
                                    <MobileStatItem>
                                        <MobileStatValue>{catData.stats.energy}</MobileStatValue>
                                        <MobileStatLabel>Energy</MobileStatLabel>
                                    </MobileStatItem>
                                    <MobileStatItem>
                                        <MobileStatValue>{catData.stats.happiness}</MobileStatValue>
                                        <MobileStatLabel>Happiness</MobileStatLabel>
                                    </MobileStatItem>
                                    <MobileStatItem>
                                        <MobileStatValue>{catData.stats.health}</MobileStatValue>
                                        <MobileStatLabel>Health</MobileStatLabel>
                                    </MobileStatItem>
                                    <MobileStatItem style={{ gridColumn: '1 / -1' }}>
                                        <MobileStatValue>{catData.stats.cleanliness}</MobileStatValue>
                                        <MobileStatLabel>Cleanliness</MobileStatLabel>
                                    </MobileStatItem>
                                </MobileStatsGrid>
                            ) : (
                                <Typography
                                    text={catData.breedDescription}
                                    size="1rem"
                                />
                            )}
                        </MobileInfoSection>

                        {/* Show contract data if available */}
                        {isUserKitty && contractData && (
                            <MobileContractData>
                                <Typography
                                    text="Your Kitty Data"
                                    size="1.1rem"
                                    color="var(--secondary-accent)"
                                    weight="600"
                                    style={{ marginBottom: '0.5rem' }}
                                />
                                <Typography
                                    text={`Name: ${contractData.name || 'Unnamed'}`}
                                    size="0.9rem"
                                />
                                <Typography
                                    text={`Created: ${new Date(contractData.created_at * 1000).toLocaleDateString()}`}
                                    size="0.9rem"
                                />
                            </MobileContractData>
                        )}
                    </MobileCatInfo>
                </MobilePopupContainer>
            </MobilePopupOverlay>
         )}
      </AnimatePresence>
   )
} 