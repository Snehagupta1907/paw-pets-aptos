import FoodCard from "@/components/Molecules/FoodCard";
import { OpacityBackgroundFade, PopUpWithTab } from "@/components/Atoms/Popup";
import { AnimatePresence } from "framer-motion";
import styled from "styled-components";
import { useState, useContext } from "react";
import Treats from "@/data/treats.json"
import Ingredients from "@/data/ingredients.json";
import { userContext } from "@/pages";
import PopupPrompt from "@/components/Molecules/PopupPrompt";
import useSound from "use-sound";
import { GameContext } from "@/pages/_app";
const PopUpGrid = styled.div`
display:grid;
grid-template-columns: repeat(2, 1fr);
justify-items:center;
gap:3em;

@media screen and (max-width: 768px) {
    grid-template-columns: repeat(1, 1fr);
    gap: 1.5rem;
}
`

export default function TreatsDex({
    onExit = () => { },
    active,

}) {
    const [pageLimit, setPageLimit] = useState(2)
    const [pageMin, setPageMin] = useState(0)
    const [currentPage, setCurrentPage] = useState(1);
    const [activePop, setActivePop] = useState(false)
    const [treat, setTreat] = useState("")
    const [cooked, setCooked] = useState(false)
    const [popText, setPopText] = useState("")
    const { currentOfferings, setCurrentOfferings, setCurrentTreats, currentTreats = [], fetchTreats, fetchOfferings, fetchLeaderboardUsers } = useContext(userContext);
    const { Volume } = useContext(GameContext);
    const [loading, setLoading] = useState(false);

    const [sound] = useSound('/sound/bamboohit.mp3', { volume: Volume, });

    const cookTreat = async (treat) => {
        // Use fallback if currentTreats is undefined
        const safeTreats = currentTreats || [];
        setPopText(`cooking...`)
        setLoading(true);
        setTimeout(() => {
            // Use treat.ing1/ing2 as array indices
            const ing1Obj = Ingredients[treat.ing1];
            const ing2Obj = Ingredients[treat.ing2];
            const ing1OfferingIndex = currentOfferings.findIndex(o => o.id === ing1Obj.id);
            const ing2OfferingIndex = currentOfferings.findIndex(o => o.id === ing2Obj.id);
            const ing1Available = ing1OfferingIndex !== -1 && currentOfferings[ing1OfferingIndex].count > 0;
            const ing2Available = ing2OfferingIndex !== -1 && currentOfferings[ing2OfferingIndex].count > 0;
            if (!ing1Available) {
                setPopText(`Missing x1 ${ing1Obj ? ing1Obj.name : 'ingredient'}`)
                setCooked(true)
                setLoading(false);
                return
            }
            else if (!ing2Available) {
                setPopText(`Missing x1 ${ing2Obj ? ing2Obj.name : 'ingredient'}`)
                setCooked(true)
                setLoading(false);
                return
            }
            else {
                // Simulate realistic cooking time (3-4 seconds)
                setTimeout(() => {
                    setCooked(true)
                    setPopText(`${treat.name} acquired!`)
                    // Decrement ingredient counts
                    const updatedOfferings = currentOfferings.map((offering) => {
                        if (offering.id === ing1Obj.id || offering.id === ing2Obj.id) {
                            return { ...offering, count: Math.max(0, offering.count - 1) };
                        }
                        return offering;
                    });
                    setCurrentOfferings(updatedOfferings);
                    localStorage.setItem('ingredients', JSON.stringify(updatedOfferings));
                    // Increment treat count
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
                }, 3000 + Math.floor(Math.random() * 1000)); // 3-4 seconds
            }
        }, 500); // Short delay before actual cooking
    }
    
    return (
        <>
            <AnimatePresence>
                {active === true &&
                    <>
                        <OpacityBackgroundFade key={"CatDex Fade"} onClick={onExit} />
                        <PopUpWithTab
                            title={"treats"}
                            onExit={onExit}
                            size={"1.2em"}
                            direction="row"
                            initial={{ y: "-100vh" }}
                            animate={{ y: "0" }}
                            exit={{ y: "-100vh" }}
                            transition={{ delay: .05, duration: .5, ease: "easeInOut" }}
                            exitTab
                            arrows
                            pos="relative"
                            onPrevious={() => {
                                if (currentPage > 1) {
                                    setCurrentPage(currentPage - 1);
                                    setPageMin(pageMin - 2);
                                    setPageLimit(pageLimit - 2);
                                }
                            }}
                            onNext={() => {
                                if (currentPage < 3) {
                                    setCurrentPage(currentPage + 1);
                                    setPageMin(pageMin + 2);
                                    setPageLimit(pageLimit + 2);
                                }
                            }}
                            content={<>
                                <PopUpGrid>
                                    {Treats && Treats.slice(pageMin, pageLimit).map((treat, id) => {
                                        return (
                                            <FoodCard key={id} onClick={() => { setActivePop(!activePop); setTreat(treat); setCooked(false) }} treatname={treat.name} treatimg={treat.image} aing={"x1"} bing={"x1"} aimg={Ingredients[treat.ing1].image} bimg={Ingredients[treat.ing2].image} />
                                        )
                                    })}
                                </PopUpGrid>
                            </>
                            }
                        >

                        </PopUpWithTab>
                    </>
                }


            </AnimatePresence>
            <AnimatePresence>
                {activePop && <>
                    <OpacityBackgroundFade key={"Treats"} onClick={() => { setActivePop(false) }} />
                    {loading ? (
                        <PopupPrompt
                            type="treats"
                            oneBtn
                            btnText1="COOKING..."
                            poptext={"Your treat is being cooked!"}
                            treat={treat.name}
                            initial={{ y: -500 }}
                            animate={{ y: "35vh" }}
                            transition={{ duration: .8, ease: "easeInOut" }}
                            exit={{ y: -500 }}
                            btnClick={() => { }}
                            onClose={() => { setActivePop(false) }}
                            // Optionally add a spinner/animation here
                        >
                            <div style={{textAlign:'center',marginTop:'1em'}}>
                                <span role="img" aria-label="cooking" style={{fontSize:'2em'}}>🍳</span>
                                <div style={{marginTop:'0.5em',fontWeight:600}}>Cooking...</div>
                            </div>
                        </PopupPrompt>
                    ) : cooked ?
                        <PopupPrompt type="treats" oneBtn btnText1="OKAY" poptext={popText} treat={treat.name} initial={{ y: -500 }} animate={{ y: "35vh" }} transition={{ duration: .8, ease: "easeInOut" }} exit={{ y: -500 }} btnClick={() => { setActivePop(false) }} btnClick1={() => cookTreat(treat)} onClose={() => { setActivePop(false) }} />
                        :
                        <PopupPrompt type="treats" btnText1="NO" btnText2="YES" poptext={`cook a ${treat.name}`} treat={treat.name} initial={{ y: -500 }} animate={{ y: "35vh" }} transition={{ duration: .8, ease: "easeInOut" }} exit={{ y: -500 }} btnClick={() => { setActivePop(false) }} btnClick1={() => cookTreat(treat)} onClose={() => { setActivePop(false) }} />
                    }
                </>}
            </AnimatePresence>

        </>
    )
}