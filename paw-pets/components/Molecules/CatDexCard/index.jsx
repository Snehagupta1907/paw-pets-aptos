import styled from "styled-components";
import Typography from "@/components/Atoms/Text";
import { AnimatePresence } from 'framer-motion';
import { EmptySpace } from "@/components/Atoms/EmptySpacer";
import Image from "next/image";
import { OpacityBackgroundFade, PopUpWithTab } from "@/components/Atoms/Popup";
import { StrokedText } from "stroked-text";
import { getStageName, getMoodName } from "@/util/kittyContract";

const CatDexCardTitle = styled.div`
background-color:#B4B0E3;
display:flex;
justify-content:space-between;
padding:1em 2em;
border-radius:1em;
box-shadow: 0px 4px 4px 0px #D9D9D9;
width:95%;
color:white;
align-items:center;
`
const CatDexCardDiv = styled(PopUpWithTab)`
`
const CatDexCardHead = styled.div`
`
const CatDexCardContent = styled.div`
display: flex;
flex-direction: row;
align-items: flex-start;
@media (max-width: 900px) {
   flex-direction: column;
}
`
const CatDexImage = styled.div`
display: flex;
align-items: center;
justify-content: center;
`
const CatDexCardText = styled.div`
display: flex;
flex-direction: column;
gap: 1em;
margin-left: 2.5em;
@media (max-width: 900px) {
   margin-left: 0;
}
`
const CatDexCardContentText = styled.div`
background-color:white;
padding:1em 1.5em;
border-radius:1em;
text-align:center;
border-bottom: 4px solid var(--accent);
`
const CatDexCardContentDescription = styled(CatDexCardContentText)`
text-align:left;
max-width:32em;
`

const StatsGrid = styled.div`
display: grid;
grid-template-columns: 1fr 1fr;
gap: 0.5em;
margin-top: 0.5em;
`

const StatItem = styled.div`
background: var(--primary);
padding: 0.5em;
border-radius: 0.5em;
text-align: center;
border: 2px solid var(--border-hard);
`

const StatValue = styled.div`
font-size: 1.2rem;
font-weight: 600;
color: var(--secondary-accent);
`

const StatLabel = styled.div`
font-size: 0.8rem;
color: var(--black);
opacity: 0.8;
`

const ContractDataSection = styled.div`
background: var(--light-accent);
padding: 1em;
border-radius: 1em;
border: 3px solid var(--border-hard);
margin-top: 1em;
`

export default function CatDexCard({
   catData,
   show,
   onExit = () => { },
   onCatExit = () => { }
}) {
   // Check if this is a user's kitty with contract data
   const isUserKitty = catData.contractData && catData.count > 0;
   const contractData = catData.contractData;

   return (
      <AnimatePresence>
         {catData.id === show && <>
            <OpacityBackgroundFade onClick={onExit} />
            <CatDexCardDiv
               id={`${catData.breedName}-card`}
               initial={{ x: "100vw", }}
               animate={{ x: "-0%" }}
               exit={{ x: "100vw" }}
               transition={{ delay: .05, duration: .5, ease: "easeInOut" }}
               title={"cat dex"}
               onExit={onExit}
               exitTab
               catDexTab
               onCatDex={onCatExit}
               content={
                  <>
                     <CatDexCardTitle>
                        <Typography
                           text={`no. ${catData?.id?.toString().padStart(2, '0')}`}
                           weight={500}
                        />
                        <CatDexCardHead>
                           <StrokedText
                              fill='var(--white)' stroke={'var(--secondary-accent)'} strokeWidth={5} style={{
                                 fontSize: '1.5rem', fontWeight: "600"
                              }}
                           >
                              {catData?.breedName}
                           </StrokedText>
                        </CatDexCardHead>
                        <Typography
                           text={`appearances: ${catData?.count ? catData?.count : 0}`}
                           weight={500}
                        />
                     </CatDexCardTitle>
                     <EmptySpace axis={"vertical"} size={15} />
                     <CatDexCardContent>
                        <CatDexImage>
                           <Image src={`${catData?.imgThumb}`} width={300} height={300} alt="cat" style={{ borderRadius: "50%", textAlign: "center" }} />
                        </CatDexImage>
                        <CatDexCardText>
                           {/* Show Stage and Mood if available */}
                           {(catData?.stage?.name || catData?.mood?.name) && (
                              <div style={{ marginBottom: '1em' }}>
                                 {catData?.stage?.name && (
                                    <Typography
                                       text={`Stage: ${catData.stage.name}`}
                                       size={"1.1rem"}
                                       color={"var(--secondary-accent)"}
                                       weight={"600"}
                                    />
                                 )}
                                 {catData?.mood?.name && (
                                    <Typography
                                       text={`Mood: ${catData.mood.name}`}
                                       size={"1.1rem"}
                                       color={"var(--secondary-accent)"}
                                       weight={"600"}
                                    />
                                 )}
                              </div>
                           )}
                           <div>
                              <Typography
                                 text={"cat breed"}
                                 size={"1.3rem"}
                                 padding={"0 0 0 .5em"}
                                 color={"var(--secondary-accent)"}
                              />
                              <CatDexCardContentText>
                                 <Typography
                                    text={catData?.breedName}
                                    size={"1.3rem"}
                                 />
                              </CatDexCardContentText>
                           </div>
                           <div>
                              <Typography
                                 text={"stage"}
                                 size={"1.3rem"}
                                 padding={"0 0 0 .5em"}
                                 color={"var(--secondary-accent)"}
                              />
                              <CatDexCardContentText>
                                 <Typography
                                    text={catData?.stage?.name || "-"}
                                    size={"1.3rem"}
                                 />
                              </CatDexCardContentText>
                           </div>
                           <div>
                              <Typography
                                 text={"description"}
                                 size={"1.3rem"}
                                 padding={"0 0 0 .5em"}
                                 color={"var(--secondary-accent)"}
                              />
                              <CatDexCardContentDescription>
                                 {catData.stats ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
                                       <Typography text={`Hunger: ${catData.stats.hunger}`} size={"1.1rem"} />
                                       <Typography text={`Energy: ${catData.stats.energy}`} size={"1.1rem"} />
                                       <Typography text={`Happiness: ${catData.stats.happiness}`} size={"1.1rem"} />
                                       <Typography text={`Health: ${catData.stats.health}`} size={"1.1rem"} />
                                       <Typography text={`Cleanliness: ${catData.stats.cleanliness}`} size={"1.1rem"} />
                                    </div>
                                 ) : (
                                    <Typography
                                       text={catData.breedDescription}
                                       size={"1.1rem"}
                                    />
                                 )}
                              </CatDexCardContentDescription>
                           </div>
                        </CatDexCardText>
                     </CatDexCardContent>
                  </>
               }
            >

            </CatDexCardDiv>
         </>
         }
      </AnimatePresence >
   )
}