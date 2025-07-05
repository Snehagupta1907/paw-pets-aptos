import styled from "styled-components";
import Typography from "@/components/Atoms/Text";
import { AnimatePresence } from "framer-motion";
import { PopUpWithTab } from "@/components/Atoms/Popup";
import { OpacityBackgroundFade } from "@/components/Atoms/Popup";
import { useContext, useState } from "react";
import { userContext } from "@/pages";
import { playWithKitty } from '@/util/kittyContract';
import toast from 'react-hot-toast';

const BtnCont = styled.div`
    // margin-top: 1em;
    display: flex;
    align-items: center;
    flex-direction: column;
    // gap: 1em;
`

export default function Offerings(
    {
        onExit = () => { },
        active,
    }
) {
    const {  selectedKitty, setIsPlaying, isPlaying, currentTreats, setCurrentTreats } = useContext(userContext);
    const [playMsg, setPlayMsg] = useState("");
    const isHungry = selectedKitty?.stats?.hunger < 40;

    return (
        <>
            <AnimatePresence>
                {active &&
                    <>
                        <OpacityBackgroundFade key={"CatDex Fade"} onClick={onExit} />
                        <PopUpWithTab
                            title={"offerings"}
                            size={"1.2em"}
                            direction="column"
                            initial={{ y: "-100vh", x: 60 }}
                            animate={{ y: "-5%", x: 60 }}
                            exit={{ y: "-100vh" }}
                            transition={{ delay: .05, duration: .5, ease: "easeInOut" }}
                            onExit={onExit}
                            exitTab
                            pos="relative"
                            content={
                                <>
                                    {isHungry && (
                                      <div style={{ color: 'var(--button-red)', fontWeight: 600, marginBottom: '1em', fontSize: '1.2em' }}>
                                        Your kitty is hungry! Please feed it before doing anything else.
                                      </div>
                                    )}
                                    {/* Treats Section */}
                                    {isHungry &&
                                    <div style={{ marginBottom: '1em' }}>
                                    <Typography text="Your Treats" size="1.1em" weight="600" color="var(--secondary-accent)" />
                                    <div style={{ display: 'flex', gap: '1em', flexWrap: 'wrap', marginTop: '0.5em' }}>
                                      {currentTreats?.map((treat, i) => (
                                        <div key={i} style={{ border: '2px solid var(--border-hard)', borderRadius: '1em', padding: '0.5em 1em', background: '#fff', minWidth: 100, textAlign: 'center' }}>
                                          <div>{treat.name}</div>
                                          <div style={{ fontSize: '0.9em', color: 'var(--secondary-accent)' }}>x{treat.count}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>}
                                    <BtnCont>
                                        <Typography text="Play with Kitty" size="1.1em" weight="600" color="var(--secondary-accent)" />
                                  
                                      {/* Play with Kitty button, only enabled if not hungry */}
                                      <button
                                        onClick={async () => {
                                          if (!selectedKitty) return;
                                          setPlayMsg("");
                                          setIsPlaying(true);
                                          try {
                                            await playWithKitty(selectedKitty.id);
                                            setPlayMsg('You played with your kitty! 😺');
                                            toast.success('You played with your kitty! 😺');
                                          } catch (e) {
                                            setPlayMsg('Something went wrong. Try again!');
                                            toast.error('Something went wrong. Try again!');
                                          }
                                          setIsPlaying(false);
                                        }}
                                        disabled={isHungry || isPlaying}
                                        style={{
                                          marginTop: '1em',
                                          padding: '0.7em 1.5em',
                                          borderRadius: '1em',
                                          background: !isHungry ? 'var(--secondary-accent)' : 'var(--border-hard)',
                                          color: 'white',
                                          fontWeight: 600,
                                          border: 'none',
                                          cursor: isPlaying || isHungry ? 'not-allowed' : 'pointer',
                                          fontSize: '1.1rem',
                                        }}
                                      >
                                        {isPlaying ? 'Playing...' : 'Play with Kitty'}
                                      </button>
                                      {playMsg && (
                                        <div style={{ marginTop: '0.5em', color: 'var(--secondary-accent)', fontWeight: 500 }}>
                                          {playMsg}
                                        </div>
                                      )}
                                    </BtnCont>
                                </>
                            }>
                        </PopUpWithTab>
                    </>
                }
            </AnimatePresence>
        </>
    )
}