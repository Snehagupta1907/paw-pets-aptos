import CatCard from "@/components/Molecules/CatCard";
import { OpacityBackgroundFade, PopUpWithTab } from "@/components/Atoms/Popup";
import { AnimatePresence } from "framer-motion";
import styled from "styled-components";
import { useState, useEffect } from "react";
import { getOwnerKittiesWithData, createKitty, getCurrentAccount } from "@/util/kittyContract";
import Typography from "@/components/Atoms/Text";
import Button from "@/components/Atoms/Button";

const PopUpGrid = styled.div`
display:grid;
grid-template-columns: repeat(2, 1fr);
justify-items:center;
gap:3em;
@media (max-width: 1280px) {
   // grid-template-columns: repeat(1, 1fr);
 }
`
const GridItem = styled.div`
display:grid
`

const CreateKittySection = styled.div`
display: flex;
flex-direction: column;
align-items: center;
gap: 1em;
padding: 2em;
background: var(--white);
border-radius: 1em;
border: 3px solid var(--border-hard);
border-bottom: 9px solid var(--border-hard);
margin-bottom: 2em;
`

const CreateKittyInput = styled.input`
padding: 0.8em 1.2em;
border: 3px solid var(--border-hard);
border-radius: 0.8em;
font-size: 1rem;
font-family: inherit;
background: var(--white);
color: var(--black);
outline: none;
transition: all 0.2s ease;

&:focus {
  border-color: var(--secondary-accent);
  box-shadow: 0 0 0 2px rgba(180, 176, 227, 0.2);
}

&::placeholder {
  color: var(--secondary-accent);
  opacity: 0.7;
}
`

const LoadingText = styled.div`
text-align: center;
padding: 2em;
color: var(--secondary-accent);
font-size: 1.1rem;
`

export default function CatDex({
   catData,
   onExit = () => { },
   active,
   selectCatCard = (id) => { return id; },
}) {
   const [pageLimit, setPageLimit] = useState(6)
   const [pageMin, setPageMin] = useState(0)
   const [currentPage, setCurrentPage] = useState(1);
   const [maxPage, setMaxPage] = useState(1);
   const [userKitties, setUserKitties] = useState([]);
   const [loading, setLoading] = useState(false);
   const [creatingKitty, setCreatingKitty] = useState(false);
   const [newKittyName, setNewKittyName] = useState("");

   // Fetch user's kitties from contract
   useEffect(() => {
      const fetchUserKitties = async () => {
         if (active) {
            setLoading(true);
            try {
               const account = await getCurrentAccount();
               const kitties = await getOwnerKittiesWithData(account);
               setUserKitties(kitties);
            } catch (error) {
               console.error("Failed to fetch user kitties:", error);
               setUserKitties([]);
            } finally {
               setLoading(false);
            }
         }
      };

      fetchUserKitties();
   }, [active]);

   // Create new kitty
   const handleCreateKitty = async () => {
      if (!newKittyName.trim()) {
         alert("Please enter a kitty name!");
         return;
      }

      setCreatingKitty(true);
      try {
         await createKitty(newKittyName.trim());
         setNewKittyName("");
         
         // Refresh user kitties
         const account = await getCurrentAccount();
         const kitties = await getOwnerKittiesWithData(account);
         setUserKitties(kitties);
         
         alert("Kitty created successfully! 🐱");
      } catch (error) {
         console.error("Failed to create kitty:", error);
         alert("Failed to create kitty. Please try again.");
      } finally {
         setCreatingKitty(false);
      }
   };

   // Combine contract kitties with existing cat data
   const combinedCatData = catData.map(cat => {
      const userKitty = userKitties.find(kitty => kitty.id === cat.id);
      return {
         ...cat,
         count: userKitty ? 1 : 0, // Show as owned if user has this kitty
         contractData: userKitty || null
      };
   });

   useEffect(() => {
      setMaxPage(Math.round((combinedCatData.length / 6)));
   }, [combinedCatData.length, pageLimit])

   return (
      <AnimatePresence>
         {active === true &&
            <>
               <OpacityBackgroundFade key={"CatDex Fade"} onClick={onExit} />
               <PopUpWithTab
                  title={"cat dex"}
                  onExit={onExit}
                  size={"1.2em"}
                  direction="row"
                  initial={{ y: "-100vh" }}
                  animate={{ y: "0vh" }}
                  exit={{ y: "-100vh" }}
                  transition={{ delay: .05, duration: .5, ease: "easeInOut" }}
                  exitTab
                  arrows
                  pos="relative"
                  onPrevious={() => {
                     if (currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                        setPageMin(pageMin - 6);
                        setPageLimit(pageLimit - 6);
                     }
                  }}
                  onNext={() => {
                     if (currentPage < maxPage) {
                        setCurrentPage(currentPage + 1);
                        setPageMin(pageMin + 6);
                        setPageLimit(pageLimit + 6);
                     }
                  }}
                  content={<>
                     {/* Create Kitty Section on top */}
                     <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                        <CreateKittySection>
                           <Typography
                              text="Create Your Own Kitty"
                              size="1.5rem"
                              weight="600"
                              color="var(--secondary-accent)"
                           />
                           <div style={{ display: 'flex', gap: '1em', alignItems: 'center' }}>
                              <CreateKittyInput
                                 type="text"
                                 placeholder="Enter kitty name..."
                                 value={newKittyName}
                                 onChange={(e) => setNewKittyName(e.target.value)}
                                 onKeyPress={(e) => e.key === 'Enter' && handleCreateKitty()}
                                 disabled={creatingKitty}
                              />
                              <Button
                                 text={creatingKitty ? "Creating..." : "Create Kitty"}
                                 onClick={handleCreateKitty}
                                 disabled={creatingKitty || !newKittyName.trim()}
                                 color="var(--button-medium)"
                                 colorhover="var(--border-hard)"
                                 border="4px solid var(--button-medium)"
                                 borderradius="15px"
                                 padding="0.8em 1.5em"
                              />
                           </div>
                        </CreateKittySection>
                        {/* Add spacing between sections */}
                        <div style={{ height: '2em' }} />
                        {/* User's Kitties Section with slider arrows */}
                        {userKitties.length > 0 && (
                           <div style={{ marginBottom: '2em', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <Typography
                                 text={`Your Kitties (${userKitties.length})`}
                                 size="1.3rem"
                                 weight="600"
                                 color="var(--secondary-accent)"
                                 style={{ marginBottom: '1em', textAlign: 'center' }}
                              />
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                                 {/* Only show arrows if more than 6 kitties */}
                                 {userKitties?.length > 6 ? (
                                    <>
                                       {/* Left Arrow */}
                                       {currentPage > 1 && (
                                          <button onClick={() => {
                                             setCurrentPage(currentPage - 1);
                                             setPageMin(pageMin - 6);
                                             setPageLimit(pageLimit - 6);
                                          }} style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none', marginRight: '1em' }}>
                                             <img src="/icons/leftarrow.svg" alt="Previous" width={48} height={48} />
                                          </button>
                                       )}
                                       {/* Kitties Grid */}
                                       <PopUpGrid style={{ flex: 1 }}>
                                          {userKitties?.slice(pageMin, pageLimit)?.map((kitty, i) => {
                                             // Find matching cat data for image
                                             const matchingCat = catData?.find?.(cat => cat?.id === kitty?.id);
                                             const displayData = {
                                                ...matchingCat,
                                                count: 1,
                                                contractData: kitty
                                             };
                                             return (
                                                <GridItem key={`user-kitty-${kitty?.id}`}>
                                                   <CatCard 
                                                      catData={displayData} 
                                                      bg="var(--white)" 
                                                      onClick={() => { selectCatCard(kitty?.id) }} 
                                                   />
                                                </GridItem>
                                             );
                                          })}
                                       </PopUpGrid>
                                       {/* Right Arrow */}
                                       {currentPage < maxPage && (
                                          <button onClick={() => {
                                             setCurrentPage(currentPage + 1);
                                             setPageMin(pageMin + 6);
                                             setPageLimit(pageLimit + 6);
                                          }} style={{ background: 'none', border: 'none', cursor: 'pointer', outline: 'none', marginLeft: '1em' }}>
                                             <img src="/icons/rightarrow.svg" alt="Next" width={48} height={48} />
                                          </button>
                                       )}
                                    </>
                                 ) : (
                                    // No arrows, just the grid centered
                                    <PopUpGrid style={{ flex: 1, justifyContent: 'center' }}>
                                       {userKitties?.map?.((kitty, i) => {
                                          const matchingCat = catData?.find?.(cat => cat?.id === kitty?.id);
                                          const displayData = {
                                             ...matchingCat,
                                             count: 1,
                                             contractData: kitty
                                          };
                                          return (
                                             <GridItem key={`user-kitty-${kitty?.id}`}>
                                                <CatCard 
                                                   catData={displayData} 
                                                   bg="var(--white)" 
                                                   onClick={() => { selectCatCard(kitty?.id) }} 
                                                />
                                             </GridItem>
                                          );
                                       })}
                                    </PopUpGrid>
                                 )}
                              </div>
                           </div>
                        )}
                     </div>
                  </>
                  }
               >

               </PopUpWithTab>
            </>
         }
      </AnimatePresence>

   )
}