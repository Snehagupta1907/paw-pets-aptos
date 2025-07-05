import { AnimatePresence } from "framer-motion";
import styled from "styled-components";
import ItemCard from "@/components/Atoms/ItemCard";
import Typography from "@/components/Atoms/Text";
import { useState, useContext } from "react";
import TreatsData from "@/data/treats.json"
import { SliderTab } from "@/components/Atoms/Slider";
import { userContext } from "@/pages";
import { GameContext } from "@/pages/_app";
import useSound from "use-sound";
import { feedKitty } from "@/util/kittyContract";


const Grid = styled.div`
display:grid;
grid-template-columns:repeat(6, 1fr);
gap:2em;
`
const GridItem = styled.div`
display: flex;
align-items: center;
justify-content: center;
flex-direction:column;

`
export default function TreatsSlider({
    active,
    onExit = () => { },
    onTreatClick = (treat) => { return treat }
}) {
    const { currentTreats, setCurrentTreats, selectedKitty } = useContext(userContext);
    const [pageLimit, setPageLimit] = useState(6)
    const [pageMin, setPageMin] = useState(0)
    const [currentPage, setCurrentPage] = useState(1);
    const [tab, setTab] = useState(true);
    const [maxPage, setMaxPage] = useState(1);
    const [feedLoading, setFeedLoading] = useState(false);
    const [feedMsg, setFeedMsg] = useState("");
    const isHungry = selectedKitty?.stats?.hunger < 40;
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
                    tab={"treats"}
                    onExit={onExit}
                    tabcolor={tab}
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
                            {tab && currentTreats.slice(pageMin, pageLimit).map((item, i) => {
                                return <GridItem key={i}>
                                    <ItemCard image={item.image} alt="MEOW MEOW" />
                                    <Typography text={`x${item.count ? item.count : 0}`} weight={"400"} size={".9rem"} />
                                    <Typography text={item.name} weight={"500"} size={"1.2rem"} />
                                    <button
                                        disabled={!isHungry || item.count < 1 || feedLoading}
                                        style={{
                                            marginTop: '0.5em',
                                            padding: '0.5em 1em',
                                            borderRadius: '1em',
                                            background: isHungry && item.count > 0 ? 'var(--secondary-accent)' : 'var(--border-hard)',
                                            color: 'white',
                                            fontWeight: 600,
                                            border: 'none',
                                            cursor: !isHungry || item.count < 1 || feedLoading ? 'not-allowed' : 'pointer',
                                            fontSize: '1rem',
                                        }}
                                        onClick={async () => {
                                            if (!selectedKitty) return;
                                            setFeedMsg("");
                                            setFeedLoading(true);
                                            try {
                                                await feedKitty(selectedKitty.id);
                                                setFeedMsg('You fed your kitty! 😺');
                                                // Decrement treat count
                                                const updatedTreats = [...currentTreats];
                                                updatedTreats[i].count -= 1;
                                                setCurrentTreats(updatedTreats);
                                                // Optionally: refresh kitty data here
                                            } catch (e) {
                                                setFeedMsg('Something went wrong. Try again!');
                                            }
                                            setFeedLoading(false);
                                        }}
                                    >
                                        {feedLoading ? 'Feeding...' : 'Feed Kitty'}
                                    </button>
                                    {feedMsg && <div style={{ color: 'var(--secondary-accent)', fontWeight: 500 }}>{feedMsg}</div>}
                                </GridItem>
                            })}
                        </Grid>
                    </>}
                >
                </SliderTab>
            }
        </AnimatePresence>
    )
}