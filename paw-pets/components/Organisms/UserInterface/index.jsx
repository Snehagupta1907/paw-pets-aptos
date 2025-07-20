import styled from "styled-components";
import IconButton from "@/components/Atoms/IconButton";
import Typography from "@/components/Atoms/Text";
import { m, AnimatePresence } from "framer-motion";
import { useState, useEffect, useContext } from "react";
import ItemsSlider from "@/components/Organisms/ItemsSlider";
import TreatsSlider from "../TreatsSlider";
import TreatsDex from "../TreatsDex";
import WeatherPopup from "@/components/Molecules/WeatherPopup";
import { StrokedText } from 'stroked-text';
import SettingsPopup from "@/components/Molecules/SettingsPopup";
import Image from "next/image";
import { userContext } from "@/pages";
import Offerings from "@/components/Molecules/OfferingPopup";
import LeaderboardDex from "@/components/Organisms/LeaderboardDex"
import CatDex from "../CatDex";
import { useMobileDetector } from "@/util/mobileDetector";

// Mobile-specific components
import MobileSettingsPopup from "@/components/Molecules/SettingsPopup/MobileSettingsPopup";
import MobileTreatsSlider from "@/components/Organisms/TreatsSlider/MobileTreatsSlider";
import TestModal from "@/components/Organisms/ItemsSlider/MobileItemsSlider";
import MobileWeatherPopup from "@/components/Molecules/WeatherPopup/MobileWeatherPopup";
import MobileCatDex from "@/components/Organisms/CatDex/MobileCatDex";
import MobileLeaderboardDex from "@/components/Organisms/LeaderboardDex/MobileLeaderboardDex";
import MobileOfferingsPopup from "@/components/Molecules/OfferingPopup/MobileOfferingsPopup";
import MobileTreatsDex from "@/components/Organisms/TreatsDex/MobileTreatsDex";

const UserInterfaceDiv = styled.div`
position:fixed;
width:100vw;
height:100vh;
padding:2.5em;
pointer-events:none;
display:flex;
flex-direction:column;
justify-content:space-between;
z-index:44;

@media screen and (max-width: 768px) {
  padding: 1rem;
}
`

const TopIcons = styled.div`
display:flex;
align-items:flex-start;
justify-content:space-between;

@media screen and (max-width: 768px) {
  flex-wrap: wrap;
  gap: 0.5rem;
}
`

const BottomIcons = styled.div`
display:flex;
align-items:flex-end;
bottom:0;
gap:2em;

@media screen and (max-width: 768px) {
  justify-content: space-around;
  gap: 0.5rem;
  flex-wrap: wrap;
}
`

const ColIcon = styled.div`
display:flex;
flex-direction:column;
justify-content:center;
text-align:${props => props.textAlign || "center"};
cursor:pointer;
pointer-events:auto;
`

const RowIcon = styled.div`
pointer-events:auto;
display:flex;

gap:${props => props.gap || ".5em"};
cursor:pointer;
`

const ProfileRow = styled(RowIcon)`
background-color: rgba(254, 249, 237, 0.8);
padding:.5em 2em;
gap:2em;
border-radius:1.5em;
border: 0px solid var(--border-hard);
border-left: 5px solid var(--border-hard);
align-self:flex-start;
transition: all .15s ease-in-out;
display: flex;
align-items: center;
&:hover {
   border: 3px solid var(--border-hard);
   background-color: var(--primary);
}

@media screen and (max-width: 768px) {
  padding: 0.5rem 1rem;
  gap: 1rem;
  border-radius: 1rem;
  border-left: 3px solid var(--border-hard);
  max-width: 200px;
}
`

const WeatherCol = styled.div`
display:flex;
flex-direction:column;
gap:1.5em;
align-self:flex-start;
`

const WeatherRow = styled(RowIcon)`
background-color: rgba(254, 249, 237, 0.8);
border: 0px solid var(--border-hard);
border-right: 5px solid var(--border-hard);
padding:.5em 1.5em;
gap:2em;
border-radius:1.5em;
align-self:flex-end;
display:flex;
transition: all .15s ease-in-out;
&:hover {
   background-color:var(--primary);
   border: 3px solid var(--border-hard);
}

@media screen and (max-width: 768px) {
  padding: 0.5rem 1rem;
  gap: 1rem;
  border-radius: 1rem;
  border-right: 3px solid var(--border-hard);
  max-width: 180px;
}
`

const SliderIcons = styled(m.div)`
position:absolute;
`

const WeatherDiv = styled.div`
display:flex;
flex-direction:column;
justify-content:center;
gap:.3em;
text-align:center;
`

const SettingsDiv = styled(m.div)`
   display:flex;
   flex-direction:column;
   gap:1.5em;
   align-self:flex-start;
`

const TextCont = styled.div`
   display:flex;
   flex-direction: column;
   gap: 0.5em;
   display: flex;
   align-items: flex-start;
`

const SettingIcon = styled.div`
   display: flex;
   align-items: center;
   gap: .5em;
`



export default function UserInterface({
   onWeatherSubmit = () => { },
   onWeatherChange = () => { },
   location,
   onActiveClick = (item) => { return item },
   onTreatClick = (treat) => { return treat },
   selectCatCard: onSelectCatCard = (id) => { return id; },
}) {
   const [cookShow, setCookShow] = useState(false);
   const [expanded, setExpanded] = useState(false);
   const [itemsShow, setItemsShow] = useState(false);
   const [treats, setTreatsShow] = useState(false);
   const [offer, setOfferShow] = useState(false);
   const [weatherShow, setWeatherShow] = useState(false);
   const [settings, setSettings] = useState(false);
   const [icon, setIcon] = useState('/weather-icons/clear-sky.gif');
   const { weather, currentUser, cats, currentUserData, catDex, setCatDex, isMobile, isTablet, isSmallMobile, isLargeMobile, orientation } = useContext(userContext);
   const [leaderboard, setLeaderboard] = useState(false);
   
   useEffect(() => {
      console.log('itemsShow state changed to:', itemsShow);
   }, [itemsShow]);
   
   useEffect(() => {
      if (weather) {
         if (weather.weather[0].main == "Clouds") {
            setIcon('/weather-icons/scattered-clouds.gif');
         } else if (weather.weather[0].main == "Clear") {
            setIcon('/weather-icons/clear-sky.gif');
         } else if (weather.weather[0].main == "Atmosphere") {
            setIcon('/weather-icons/mist.gif');
         } else if (weather.weather[0].main == "Rain") {
            setIcon('/weather-icons/rain.gif');
         } else if (weather.weather[0].main == "Drizzle") {
            setIcon('/weather-icons/shower-rain.gif');
         } else if (weather.weather[0].main == "Snow") {
            setIcon('/weather-icons/snow.gif');
         } else if (weather.weather[0].main == "Thunderstorm") {
            setIcon('/weather-icons/thunderstorm.gif');
         }
      }
   }, [weather]);
   return (
      <>
         <UserInterfaceDiv className={isMobile ? 'user-interface-mobile' : ''}>
            <TopIcons className={isMobile ? 'top-icons-mobile' : ''}>
               <RowIcon className={isMobile ? 'row-icon-mobile' : ''}>
                  <WeatherCol className={isMobile ? 'weather-col-mobile' : ''}>
                     <ProfileRow
                        onClick={() => { setSettings(!settings) }}
                        id="logout"
                        className={isMobile ? 'profile-row-mobile' : ''}
                     >
                        <IconButton 
                           image={currentUserData.avatar ? currentUserData.avatar : "/user/pfp.svg"} 
                           alt="Profile Icon" 
                           width={isMobile ? 50 : 100}
                           height={isMobile ? 50 : 100}
                        />
                        <TextCont className={isMobile ? 'text-cont-mobile' : ''}>
                           <StrokedText fill='var(--white)' stroke='var(--border-hard)' strokeWidth={5} style={{
                              fontSize: isMobile ? '1.2rem' : '1.5rem',
                           }}>
                              {currentUser.displayName}
                           </StrokedText>
                           <SettingIcon className={isMobile ? 'setting-icon-mobile' : ''}>
                              <StrokedText fill='var(--white)' stroke='var(--button-medium)' strokeWidth={5} style={{
                                 fontSize: isMobile ? '1rem' : '1.2rem',
                              }}>
                                 settings
                              </StrokedText>
                              <Image
                                 src={'/icons/settingsIcon.svg'}
                                 width={isMobile ? 20 : 25}
                                 height={isMobile ? 20 : 25}
                                 alt={"settings gear logo"}
                              />
                           </SettingIcon>
                        </TextCont>
                     </ProfileRow>
                     <AnimatePresence>
                        {
                           settings && (
                              isMobile ? (
                                 <MobileSettingsPopup active={settings} onExit={() => { setSettings(false) }} />
                              ) : (
                                 <SettingsDiv
                                    initial={{ x: "-120%" }}
                                    animate={{ x: -0 }}
                                    exit={{ x: "-120%" }}
                                    transition={{ duration: .5 }}
                                    className={isMobile ? 'settings-div-mobile' : ''}>
                                    <SettingsPopup onExit={() => { setSettings(false) }} />
                                 </SettingsDiv>
                              )
                           )
                        }
                     </AnimatePresence>
                  </WeatherCol>

               </RowIcon>
               <WeatherCol className={isMobile ? 'weather-col-mobile' : ''}>
                  {weather && <>
                     <WeatherRow onClick={() => { setWeatherShow(!weatherShow) }} id="weather" className={isMobile ? 'weather-row-mobile' : ''}>
                        <IconButton 
                           image={icon} 
                           alt="Weather Icon" 
                           width={isMobile ? 50 : 100}
                           height={isMobile ? 50 : 100}
                        />
                        <WeatherDiv className={isMobile ? 'weather-div-mobile' : ''}>
                           <Typography
                              text={weather.weather[0].main}
                              weight={"600"}
                              size={isMobile ? "1rem" : "1.2rem"}
                           />
                           <Typography
                              text={`${weather.main.temp} °C`}
                              size={isMobile ? "1.5rem" : "1.8rem"}
                              color={"var(--border-hard)"}
                              weight={"500"}
                           />
                        </WeatherDiv>
                     </WeatherRow>
                  </>
                  }
               </WeatherCol>

            </TopIcons>
            <BottomIcons className={isMobile ? 'bottom-icons-mobile' : ''}>
               <ColIcon onClick={()=> { setCatDex(true) }} id="catdex" className={isMobile ? 'col-icon-mobile' : ''}>
                  <IconButton 
                     image={"/menuIcons/catdex.svg"} 
                     alt="CatDex Button" 
                     type={'menu'}
                     width={isMobile ? 60 : 100}
                     height={isMobile ? 60 : 100}
                  />
                  <Typography
                     text={"cat dex"}
                     weight={"600"}
                     size={isMobile ? "1rem" : "1.2rem"}
                  />
               </ColIcon>
               <ColIcon onClick={() => { 
                  console.log('Items button clicked! Setting itemsShow to true');
                  setItemsShow(true); 
               }} className={isMobile ? 'col-icon-mobile' : ''}>
                  <IconButton 
                     image={"/menuIcons/items.svg"} 
                     alt="Items Button" 
                     type={'menu'}
                     width={isMobile ? 60 : 100}
                     height={isMobile ? 60 : 100}
                  />
                  <Typography
                     text={"items"}
                     weight={"600"}
                     size={isMobile ? "1rem" : "1.2rem"}
                  />
               </ColIcon>

               <ColIcon className={isMobile ? 'col-icon-mobile' : ''}>
                  <AnimatePresence>
                     {expanded &&
                        <SliderIcons
                           initial={{ opacity: 0, y: 100, x: "-25%" }}
                           animate={{ opacity: 1, y: -125 }}
                           exit={{ opacity: 0, y: 125 }}
                           transition={{ duration: .25 }}
                           className={isMobile ? 'slider-icons-mobile' : ''}
                        >
                           <RowIcon gap={isMobile ? "1rem" : "2em"} className={isMobile ? 'row-icon-mobile' : ''}>
                              <ColIcon className={isMobile ? 'col-icon-mobile' : ''}>
                                 <IconButton 
                                    image={"/menuIcons/place.svg"} 
                                    alt="Cooking Button" 
                                    onClick={() => { setTreatsShow(true) }} 
                                    type={'menu'}
                                    width={isMobile ? 60 : 100}
                                    height={isMobile ? 60 : 100}
                                 />
                                 <Typography
                                    text={"place"}
                                    weight={"600"}
                                    size={isMobile ? "1rem" : "1.2rem"}
                                 />
                              </ColIcon>
                              <ColIcon className={isMobile ? 'col-icon-mobile' : ''}>
                                 <IconButton 
                                    image={"/menuIcons/cook.svg"} 
                                    alt="Cooking Button" 
                                    onClick={() => { setCookShow(true) }} 
                                    type={'menu'}
                                    width={isMobile ? 60 : 100}
                                    height={isMobile ? 60 : 100}
                                 />
                                 <Typography
                                    text={"cook"}
                                    weight={"600"}
                                    size={isMobile ? "1rem" : "1.2rem"}
                                 />
                              </ColIcon>
                           </RowIcon>
                        </SliderIcons>
                     }
                  </AnimatePresence>
                  <ColIcon onClick={() => { setExpanded(!expanded) }} className={isMobile ? 'col-icon-mobile' : ''}>
                     <IconButton 
                        image={"/menuIcons/treats.svg"} 
                        alt="Treats Button" 
                        type={'menu'}
                        width={isMobile ? 60 : 100}
                        height={isMobile ? 60 : 100}
                     />
                     <Typography
                        text={"treats"}
                        weight={"600"}
                        size={isMobile ? "1rem" : "1.2rem"}
                     />
                  </ColIcon>
               </ColIcon>

               <ColIcon onClick={() => { setOfferShow(true) }} className={isMobile ? 'col-icon-mobile' : ''}>
                  <IconButton 
                     image={"/menuIcons/offerings.svg"} 
                     alt="Offerings Button" 
                     type={'menu'}
                     width={isMobile ? 60 : 100}
                     height={isMobile ? 60 : 100}
                  />
                  <Typography
                     text={"offerings"}
                     weight={"600"}
                     size={isMobile ? "1rem" : "1.2rem"}
                  />
               </ColIcon>

               <ColIcon onClick={() => { setLeaderboard(true) }} className={isMobile ? 'col-icon-mobile' : ''}>
                  <IconButton 
                     image={"/menuIcons/leaderboard.svg"} 
                     alt="Leaderboard Button" 
                     type={'menu'}
                     width={isMobile ? 60 : 100}
                     height={isMobile ? 60 : 100}
                  />
                  <Typography
                     text={"leaderboard"}
                     weight={"600"}
                     size={isMobile ? "1rem" : "1.2rem"}
                  />
               </ColIcon>

            </BottomIcons>
         </UserInterfaceDiv>

         {isMobile ? (
            <MobileTreatsSlider active={treats}
               onExit={() => { setTreatsShow(false) }} onTreatClick={onTreatClick} />
         ) : (
            <TreatsSlider active={treats}
               onExit={() => { setTreatsShow(false) }} onTreatClick={onTreatClick} />
         )}

         {isMobile ? (
            <TestModal active={itemsShow}
               onExit={() => { 
                  console.log('TestModal onExit called! Setting itemsShow to false');
                  setItemsShow(false); 
               }}
               onActiveClick={onActiveClick} />
         ) : (
            <ItemsSlider onActiveClick={onActiveClick} active={itemsShow}
               onExit={() => { setItemsShow(false) }} />
         )}

         {isMobile ? (
            <MobileWeatherPopup active={weatherShow} onExit={() => { setWeatherShow(false) }} />
         ) : (
            <WeatherPopup location={location} onWeatherChange={onWeatherChange} onWeatherSubmit={onWeatherSubmit} active={weatherShow} onExit={() => { setWeatherShow(false) }} />
         )}

         {isMobile ? (
            <MobileOfferingsPopup active={offer} onExit={() => { setOfferShow(false) }} />
         ) : (
            <Offerings active={offer} btnText={"ACKNOWLEDGE ALL"}
               onExit={() => { setOfferShow(false) }}
            />
         )}

         {isMobile ? (
            <MobileTreatsDex active={cookShow} onExit={() => { setCookShow(false) }} />
         ) : (
            <TreatsDex active={cookShow} onExit={() => { setCookShow(false) }} />
         )}
         {isMobile ? (
            <>
               {console.log('Rendering MobileCatDex, isMobile:', isMobile, 'catDex:', catDex)}
               <MobileCatDex 
                   active={catDex} 
                   onExit={() => { setCatDex(false) }} 
                   selectCatCard={(kittyId) => { 
                       // Call the prop function passed from parent
                       onSelectCatCard(kittyId);
                   }}
               />
            </>
         ) : (
            <>
               {console.log('Rendering Desktop CatDex, isMobile:', isMobile, 'catDex:', catDex)}
               <CatDex catData={cats} active={catDex} onExit={() => { setCatDex(false) }} activeCats={cats} selectCatCard={(id) => { onSelectCatCard(id) }} />
            </>
         )}
         {isMobile ? (
            <MobileLeaderboardDex active={leaderboard}
               onExit={() => { setLeaderboard(false) }} />
         ) : (
            <LeaderboardDex active={leaderboard}
               onExit={() => { setLeaderboard(false) }} />
         )}

      </>
   )
}