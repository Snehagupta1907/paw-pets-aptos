import Image from "next/image"
import { AnimatePresence, m } from "framer-motion"
import styled, { keyframes } from "styled-components"
import CatTextBox from "@/components/Molecules/CatTextBox";
import { selectRandomFromArray } from "@/util";
import { useState, useContext, useRef } from "react";
import useSound from "use-sound";
import { GameContext } from "@/pages/_app";
import catMeow from "@/data/meow.json";
import { sleepKitty, cleanKitty } from "@/util/kittyContract";

const spin = keyframes`
  100% { transform: rotate(360deg); }
`;

const CatImage = styled(Image)`
cursor:pointer;
user-drag: none;
-webkit-user-drag: none;
user-select: none;
-moz-user-select: none;
-webkit-user-select: none;
-ms-user-select: none;
pointer-events:auto;
transition: all ease-in-out ${props => props.transitionduration || ".2"}s;
&:hover{
   filter: drop-shadow(5px 5px 3px rgba(0, 0, 0, 0.2));
   transform:scale(1.1);
}
animation: ${props => props.isPlaying ? spin : "none"} 1s linear infinite;
`

const CatDiv = styled.div`
bottom:${props => props.bottom || ""};
right:${props => props.right || ""};
z-index:45;
position:absolute;
display:flex;
flex-direction:column;
justify-content:center;
align-items:center;
transform:translate(-20vw, -10vh);
pointer-events:auto;
user-drag: none;
-webkit-user-drag: none;
user-select: none;
-moz-user-select: none;
-webkit-user-select: none;
-ms-user-select: none;
`
const CatBox = styled(m.div)`
pointer-events:none;
z-index:43;
`
export default function Advisor({ selectedKitty, isPlaying }) {
   const [textbox, setTextBox] = useState(false);
   const [text, setText] = useState("")
   const [sleeping, setSleeping] = useState(false);
   const [sleepMsg, setSleepMsg] = useState("");
   const [cleaning, setCleaning] = useState(false);
   const [cleanMsg, setCleanMsg] = useState("");
   const HandleTextBox = () => {
      setText(getKittyStatus(selectedKitty));
      setTextBox(!textbox)
   };
   const meow = useRef("/sound/meow1.mp3")
   const { Volume } = useContext(GameContext);
   const [sound] = useSound(meow.current, { volume: Volume, });

   // Helper to get kitty status message
   function getKittyStatus(kitty) {
      if (!kitty?.stats) return "";
      const { hunger, happiness, health, energy, cleanliness } = kitty.stats;
      if (hunger < 40) return "meow! feed me, I'm starving!";
      if (health < 50) return "meow... not feline so good!";
      if (cleanliness < 50) return "eww! I need a bath, meow!";
      if (energy < 20) return "so...sleepy... zzz...";
      if (energy < 40) return "yawn... time for a catnap!";
      if (happiness < 50) return "mew... your kitty needs some cuddles!";
      return "purrfect! your kitty is feline happy right meow!";
    }

   // Sleep action
   const handleSleep = async () => {
      setSleeping(true);
      setSleepMsg("Kitty is sleeping... zzz");
      try {
         await sleepKitty(selectedKitty.id);
         setSleepMsg("Kitty is now well rested!");
         // Optionally: refresh kitty stats here
      } catch (e) {
         setSleepMsg("Something went wrong. Try again!");
      }
      setTimeout(() => setSleeping(false), 2000);
   };

   // Clean action
   const handleClean = async () => {
      setCleaning(true);
      setCleanMsg("Kitty is taking a bath...");
      try {
         await cleanKitty(selectedKitty.id);
         setCleanMsg("Kitty is now squeaky clean!");
         // Optionally: refresh kitty stats here
      } catch (e) {
         setCleanMsg("Something went wrong. Try again!");
      }
      setTimeout(() => setCleaning(false), 2000);
   };

   // Priority logic: feed > health > bath > sleep
   const needsFeeding = selectedKitty?.stats?.hunger < 40;
   const needsHealth = selectedKitty?.stats?.health < 50;
   const needsBath = selectedKitty?.stats?.cleanliness < 50;
   const isVerySleepy = selectedKitty?.stats?.energy < 30 && !needsBath && !needsFeeding && !needsHealth;

   return (
      <CatBox>
         <CatDiv>
                        {selectedKitty ? (
               <div style={{position:'relative', width:180, height:180}}>
                  <CatImage
                     src={selectedKitty.catImage}
                     id="advisor"
                     width={180}
                     height={180}
                     alt={selectedKitty.name || 'this is your advisor'}
                     isPlaying={isPlaying}
                     onClick={async ()=>{HandleTextBox(); let randomMeow = await selectRandomFromArray(catMeow[0]); meow.current = await randomMeow; sound()}}
                  />
                  {/* Dirt patches if needsBath */}
                  {needsBath && (
                     <>
                        {/* Large dark brown patch */}
                        <span style={{position:'absolute', left:30, top:25, fontSize:'2.8em', color:'#4B2E05', opacity:0.8, filter:'blur(0.5px)'}}>●</span>
                        {/* Medium black patch */}
                        <span style={{position:'absolute', right:40, top:70, fontSize:'2em', color:'#222', opacity:0.7, filter:'blur(0.5px)'}}>●</span>
                        {/* Small dark brown patch */}
                        <span style={{position:'absolute', left:100, bottom:40, fontSize:'1.3em', color:'#6B3E26', opacity:0.6, filter:'blur(0.5px)'}}>●</span>
                        {/* Medium brown patch */}
                        <span style={{position:'absolute', left:70, top:120, fontSize:'1.7em', color:'#8B5C2A', opacity:0.7, filter:'blur(0.5px)'}}>●</span>
                        {/* Small black patch */}
                        <span style={{position:'absolute', right:60, bottom:50, fontSize:'1.1em', color:'#111', opacity:0.6, filter:'blur(0.5px)'}}>●</span>
                        {/* Extra small dark brown patch */}
                        <span style={{position:'absolute', left:120, top:60, fontSize:'0.9em', color:'#3B230C', opacity:0.5, filter:'blur(0.5px)'}}>●</span>
                        {/* Extra small black patch */}
                        <span style={{position:'absolute', left:150, bottom:20, fontSize:'0.8em', color:'#000', opacity:0.5, filter:'blur(0.5px)'}}>●</span>
                     </>
                  )}
                  {/* Sleepy Zs if allowed */}
                  {isVerySleepy && (
                     <>
                        <span style={{position:'absolute', left:10, top:10, fontSize:'2em', color:'#fff', fontWeight:700, animation:'floatZ 1.5s infinite alternate'}}>Z</span>
                        <span style={{position:'absolute', right:20, top:30, fontSize:'1.5em', color:'#fff', fontWeight:700, animation:'floatZ2 1.2s infinite alternate'}}>Z</span>
                        <span style={{position:'absolute', left:60, bottom:10, fontSize:'1.2em', color:'#fff', fontWeight:700, animation:'floatZ3 1.8s infinite alternate'}}>z</span>
                        <style>{`
                           @keyframes floatZ { 0%{transform:translateY(0);} 100%{transform:translateY(-10px);} }
                           @keyframes floatZ2 { 0%{transform:translateY(0);} 100%{transform:translateY(-7px);} }
                           @keyframes floatZ3 { 0%{transform:translateY(0);} 100%{transform:translateY(-5px);} }
                        `}</style>
                     </>
                  )}
               </div>
            ) : (
               <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '180px',
                  height: '180px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '50%',
                  border: '3px solid var(--secondary-accent)',
                  padding: '1em',
                  textAlign: 'center'
               }}>
                  <div style={{
                     fontSize: '1.2rem',
                     fontWeight: '600',
                     color: 'var(--secondary-accent)',
                     marginBottom: '0.5em'
                  }}>
                     Select a Kitty
                  </div>
                  <div style={{
                     fontSize: '0.9rem',
                     color: 'var(--black)',
                     opacity: 0.8
                  }}>
                     Choose a cat from your dex to interact with
                  </div>
               </div>
            )}
            {/* Action buttons by priority - only show if kitty is selected */}
            {selectedKitty && (
               <>
                  {needsFeeding && (
                     <div style={{marginTop:'1em', color:'var(--button-red)', fontWeight:600}}>Feed your kitty first!</div>
                  )}
                  {!needsFeeding && needsHealth && (
                     <div style={{marginTop:'1em', color:'var(--button-red)', fontWeight:600}}>Kitty needs healing first!</div>
                  )}
                  {!needsFeeding && !needsHealth && needsBath && (
                     <button
                        onClick={handleClean}
                        disabled={cleaning}
                        style={{
                           marginTop: '1em',
                           padding: '0.5em 1.5em',
                           borderRadius: '1em',
                           background: cleaning ? '#ccc' : '#8B5C2A',
                           color: 'white',
                           fontWeight: 600,
                           border: 'none',
                           cursor: cleaning ? 'not-allowed' : 'pointer',
                           fontSize: '1.1rem',
                        }}
                     >
                        {cleaning ? 'Cleaning...' : 'Clean Kitty'}
                     </button>
                  )}
                  {cleanMsg && needsBath && (
                     <div style={{marginTop:'0.5em', color:'#8B5C2A', fontWeight:600}}>{cleanMsg}</div>
                  )}
                  {!needsFeeding && !needsHealth && !needsBath && isVerySleepy && (
                     <button
                        onClick={handleSleep}
                        disabled={sleeping}
                        style={{
                           marginTop: '1em',
                           padding: '0.5em 1.5em',
                           borderRadius: '1em',
                           background: sleeping ? '#ccc' : 'var(--secondary-accent)',
                           color: 'white',
                           fontWeight: 600,
                           border: 'none',
                           cursor: sleeping ? 'not-allowed' : 'pointer',
                           fontSize: '1.1rem',
                        }}
                     >
                        {sleeping ? 'Sleeping...' : 'Let Kitty Sleep'}
                     </button>
                  )}
                  {sleepMsg && isVerySleepy && !needsBath && (
                     <div style={{marginTop:'0.5em', color:'var(--secondary-accent)', fontWeight:600}}>{sleepMsg}</div>
                  )}
               </>
            )}
            <AnimatePresence>
               {textbox && selectedKitty && <CatTextBox text={text} name={selectedKitty.name || "Kitty"} />}
            </AnimatePresence>
         </CatDiv>
      </CatBox>
   )
}