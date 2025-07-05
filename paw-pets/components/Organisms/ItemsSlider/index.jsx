import { AnimatePresence } from "framer-motion";
import styled from "styled-components";
import ItemCard from "@/components/Atoms/ItemCard";
import Typography from "@/components/Atoms/Text";
import { useState, useContext } from "react";
import { SliderTab } from "@/components/Atoms/Slider";
import { userContext } from "@/pages";
import { GameContext } from "@/pages/_app";
import useSound from "use-sound";
import { addAccessoryWithPayment, ACCESSORY_CATEGORIES } from "@/util/kittyContract";
import toast from 'react-hot-toast';

const categoryKeys = Object.keys(ACCESSORY_CATEGORIES);
function getRandomCategory() {
  const idx = Math.floor(Math.random() * categoryKeys.length);
  return ACCESSORY_CATEGORIES[categoryKeys[idx]].id;
}

const Grid = styled.div`
display:grid;
grid-template-columns:repeat(6, 1fr);
gap:2em;
// @media (max-width: 1280px) {
//    grid-template-columns:repeat(3, 1fr);
// }
`
const GridItem = styled.div`
display: flex;
align-items: center;
justify-content: center;
flex-direction:column;
`
export default function ItemsSlider({
   active,
   onExit = () => { },
   onActiveClick = (item) => { return item },
}) {
   const { currentItems, currentOfferings } = useContext(userContext)
   const [pageLimit, setPageLimit] = useState(6)
   const [pageMin, setPageMin] = useState(0)
   const [currentPage, setCurrentPage] = useState(1);
   const [tab, setTab] = useState(true);
   const [maxPage, setMaxPage] = useState(1);

   const { Volume } = useContext(GameContext);
   const [sound] = useSound('/sound/bamboohit.mp3', { volume: Volume, });

   
   return (
      <AnimatePresence>
         {active &&
            <SliderTab
               initial={{ y: "50vh" }}
               animate={{ y: 10 }}
               exit={{ y: "50vh" }}
               transition={{ delay: .05, duration: .5, ease: "easeInOut" }}
               tab={"items"}
               secondtab={"ingredients"}
               onExit={onExit}
               tabcolor={tab}
               onTab={() => { setTab(true); setCurrentPage(1); setPageMin(0); setPageLimit(6) }}
               onSecondTab={() => { setTab(false); setCurrentPage(1); setPageMin(0); setPageLimit(6); }}
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
                  <Grid>
                     {tab
                        ?
                        <>
                           {
                              currentItems.slice(pageMin, pageLimit).map((item, i) => {
                                 return <GridItem key={i} onClick={() => { onActiveClick(item); }}>
                                    <ItemCard image={item.image} alt={item.name} />
                                    <Typography text={`x${item.count ? item.count : 0}`} weight={"400"} size={".9rem"} />
                                    <Typography text={item.name} weight={"500"} size={"1.2rem"} />
                                    <button
                                      style={{
                                        marginTop: "0.5em",
                                        padding: "0.4em 1em",
                                        borderRadius: "8px",
                                        border: "none",
                                        background: "#ffb347",
                                        color: "#222",
                                        fontWeight: "bold",
                                        cursor: "pointer"
                                      }}
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        // TODO: Replace with actual kittyId selection logic
                                        const kittyId = 0; // You should get this from context or props
                                        const randomCategory = getRandomCategory();
                                        try {
                                          const result = await addAccessoryWithPayment(kittyId, item.name, randomCategory);
                                          if (result.success) {
                                            toast.success(`🎉 Accessory "${item.name}" added as ${categoryKeys[randomCategory]}!`);
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
                                    </button>
                                 </GridItem>
                              })
                           }
                        </>
                        :
                        currentOfferings.slice(pageMin, pageLimit).map((item, i) => {
                           return <GridItem key={i}>
                              <ItemCard image={item.image} alt={item.name} />
                              <Typography text={`x${item.count ? item.count : 0}`} weight={"400"} size={".9rem"} />
                              <Typography text={item.name} weight={"500"} size={"1.2rem"} />
                           </GridItem>
                        })
                     }
                  </Grid>
               </>}
            >

            </SliderTab>
         }
      </AnimatePresence>
   )
}