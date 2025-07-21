"use client"
import Head from 'next/head'
import styles from '@/styles/Home.module.css'
import axios from 'axios';
import { selectRandomFromArray, generateRandomNumber, getOwnerKittiesWithData, getCurrentAccount } from '@/util';
import { useEffect, useState, useRef, createContext, useContext } from 'react';
import useSound from 'use-sound';
import CatDexCard from '@/components/Molecules/CatDexCard';
import MobileCatDexCard from '@/components/Molecules/CatDexCard/MobileCatDexCard';
import UserInterface from '@/components/Organisms/UserInterface';
import Cat from '@/components/Atoms/Cat';
import styled from 'styled-components';
import ItemData from "@/data/items.json"
import TreatsData from "@/data/treats.json"
import CatData from "@/data/cat.json"
import Item from '@/components/Atoms/Item';
import Treats from '@/components/Atoms/Treats';
import { EmptySpace } from '@/components/Atoms/EmptySpacer';
import Advisor from '@/components/Atoms/Advisor';
import OfferingsData from "@/data/ingredients.json";
import { GameContext } from './_app';
import Loader from '@/components/Molecules/Loader';
import catMeow from "@/data/meow.json";
import WalletConnect from '@/components/Atoms/WalletConnect';
import { useAccount, useDisconnect } from 'wagmi';
import { useMobileDetector } from '@/util/mobileDetector';
import { addMobileTouchListeners, removeMobileTouchListeners, isTouchDevice } from '@/util/mobileTouchHandler';

const GameArea = styled.div`
position:absolute;
width:100vw;
height:100vh;
padding:2.5em;
display:flex;
align-items:center;
justify-content:center;
pointer-events:auto;

@media screen and (max-width: 768px) {
  padding: 1rem;
}
`

const PopUps = styled.div`
width:100%;
height:100%;
display:flex;
justify-content:center;
align-items:center;
position:absolute;
pointer-events:none;
`

export const userContext = createContext()

export default function Home() {
  const [selectedKitty, setSelectedKitty] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { isMobile, isTablet, isSmallMobile, isLargeMobile, orientation } = useMobileDetector();

  // Wagmi hooks
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  // wallet state
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAccount, setWalletAccount] = useState(null);

  // game data
  const [cats, setCats] = useState([]);
  const [catDex, setCatDex] = useState(false);
  const [catCard, setCatCard] = useState(0);
  const [randomCats, setRandomCats] = useState([]);

  // user data - now based on wallet
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState({
    location: "India",
    avatar: "/user/pfp.svg",
    catsVisited: 15,
    catsCompletion: 8
  })
  const [currentItems, setCurrentItems] = useState([]);
  const [activeItems, setActiveItems] = useState([]);
  const [activetreats, setActiveTreats] = useState([]);
  const [currentOfferings, setCurrentOfferings] = useState([])
  const [currentTreats, setCurrentTreats] = useState([]);
  const [currentLeaderboard, setCurrentLeaderboard] = useState([])

  // user weather data
  const [location, setLocation] = useState("India");
  const [weather, setWeather] = useState();
  const [lang, setLang] = useState("en");
  const [units, setUnits] = useState("metric");
  const [background, setBackground] = useState('day');

  // api urls
  const weatherUrl = useRef(`/api/weather?lang=${lang}&units=${units}&location=${location}`)
  const catUrl = useRef('/api/catbreed');

  // sound data
  const { Volume, setVolume, BGMVolume } = useContext(GameContext)
  const [bgm, bgmController] = useSound('/music/bgm1.mp3', {
    volume: BGMVolume - .1, autoplay: true, loop: true,
  }
  );

  // Sync Wagmi connection state
  useEffect(() => {
    if (isConnected && address) {
      setIsWalletConnected(true);
      setWalletAccount(address);
      setCurrentUser({
        displayName: `User ${address.slice(0, 6)}...`,
        uid: address,
        address: address
      });
    } else {
      setIsWalletConnected(false);
      setWalletAccount(null);
      setCurrentUser(null);
    }
  }, [isConnected, address]);

  // Wallet connection handlers
  const handleWalletConnect = (address) => {
    setIsWalletConnected(true);
    setWalletAccount(address);
    setCurrentUser({
      displayName: `User ${address.slice(0, 6)}...`,
      uid: address,
      address: address
    });
  };

  const handleWalletDisconnect = async () => {
    try {
      disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    } finally {
      setIsWalletConnected(false);
      setWalletAccount(null);
      setCurrentUser(null);
      // Reset all game state
      setCats([]);
      setRandomCats([]);
      setCurrentItems([]);
      setActiveItems([]);
      setActiveTreats([]);
      setCurrentOfferings([]);
      setCurrentTreats([]);
      setCurrentLeaderboard([]);
    }
  };

  const fetchWeather = async () => {
    try {
      const weatherResult = await axios.get(weatherUrl.current);
      const weather = weatherResult.data
      if (weather) {
        if (weather.rain) {
          setBackground('rain')
        }
        else if (weather.weather[0].main === "Snow") {
          setBackground('snow')
        }
        else if (weather.clouds.all > 50) {
          setBackground('night')
        }
        else {
          setBackground('day')
        }
      }
      return weather
    } catch (error) {
      setLocation("India");
      alert("an error has occured, your location has been reset to India")
      const weatherResult = await axios.get(`/api/weather?lang=${lang}&units=${units}&location=India`)
      return weatherResult.data
    }
  }

  const setNewWeather = async () => {
    const weatherResult = await fetchWeather();
    setWeather(weatherResult);
  }

  const onWeatherChange = async (value) => {
    setLocation(value.target.value)
    weatherUrl.current = `/api/weather?lang=${lang}&units=${units}&location=${value.target.value}`
  }

  // Hardcoded data functions
  const getHardcodedItems = () => {
    return ItemData.map(item => ({
      ...item,
      count: Math.floor(Math.random() * 5) + 1,
      itemID: item.id
    }));
  }

  const getHardcodedTreats = () => {
    return TreatsData.map(treat => ({
      ...treat,
      count: Math.floor(Math.random() * 3) + 1,
      itemID: treat.id
    }));
  }

  const getHardcodedOfferings = () => {
    return OfferingsData.map(offering => ({
      ...offering,
      count: Math.floor(Math.random() * 10) + 1,
      state: Math.random() > 0.5,
      itemID: offering.id
    }));
  }

  const getHardcodedCats = async () => {
    const catResults = await axios.get(catUrl.current);
    return catResults.data.map(cat => ({
      ...cat,
      count: Math.floor(Math.random() * 3) + 1,
      catId: cat.id
    }));
  }

  const getHardcodedLeaderboard = () => {
    return [
      { username: "CatLover123", catsVisited: 25, avatar: "/user/pfp.svg" },
      { username: "MeowMaster", catsVisited: 22, avatar: "/user/pfp2.svg" },
      { username: "Purrfect", catsVisited: 20, avatar: "/user/pfp3.svg" },
      { username: "Whiskers", catsVisited: 18, avatar: "/user/pfp4.svg" },
      { username: currentUser?.displayName || "Demo User", catsVisited: 15, avatar: "/user/pfp.svg" }
    ];
  }

  const meow = useRef("/sound/meow1.mp3")
  const [meowSound] = useSound(meow.current, { volume: Volume, });
  
  const generateCats = async (data, amountOfCats) => {
    let randomMeows = randomCats;
    for (let i = 0; i < amountOfCats; i++) {
      let randomCat = await selectRandomFromArray(data);
      const x = generateRandomNumber(0, 100);
      let y;
      randomCat.img = await selectRandomFromArray(CatData);
      randomCat.x = x;
      if (x < 15 || x < 85) y = generateRandomNumber(0, 100);
      else if (x > 15 || x < 85) {
        let helper = generateRandomNumber(1, 2)
        if (helper === 1) y = generateRandomNumber(90, 100)
        if (helper === 2) y = generateRandomNumber(0, 15)
      }
      randomCat.y = y;
      let offering = await selectRandomFromArray(OfferingsData)
      offering.cat = await randomCat.breedName
      offering.catImg = await randomCat.imgThumb
      console.log(offering)
      randomMeows.push(randomCat);
    }
    let randomMeow = await selectRandomFromArray(catMeow[0]);
    setRandomCats(randomMeows)
    meow.current = await randomMeow;
    await meowSound();
  }

  const fetchAllData = async () => {
    const weatherResult = await fetchWeather();
    const offerings = getHardcodedOfferings();
    const items = getHardcodedItems();
    const treats = getHardcodedTreats();
    const leaderboard = getHardcodedLeaderboard();
    
    // Fetch user's kitties from contract
    let userKitties = [];
    try {
      const account = await getCurrentAccount();
      userKitties = await getOwnerKittiesWithData(account);
      console.log("User kitties fetched:", userKitties);
    } catch (error) {
      console.log("No user kitties found or error fetching:", error);
      userKitties = [];
    }
    
    // Add dummy images to contract kitties using hardcoded cat data
    const kittiesWithImages = userKitties.map((kitty, index) => {
      const catImageNumber = ((kitty.id % 16) + 1);
      return {
        ...kitty,
        id: kitty.id,
        breedName: kitty.name || `Kitty ${kitty.id}`,
        catImage: `/cats/cat${catImageNumber}.png`,
        imgThumb: `/cats/cat${catImageNumber}.png`,
        img: `/cats/cat${catImageNumber}.png`,
        origin: "",
        breedDescription: "",
        count: 1
      };
    });
    
    
    try {
      setWeather(weatherResult);
      setCurrentItems(items);
      setCurrentOfferings(offerings);
      setCurrentTreats(treats)
      setCats(kittiesWithImages); // Use contract kitties with dummy images
      setCurrentLeaderboard(leaderboard);
    }
    catch (error) {
      console.log(error)
    }
  }

  const addActiveItem = async (item) => {
    if (item.count >= 1) {
      setActiveItems([...activeItems, item])
      item.count -= 1
      soundPlace();
    }
  }
  const [soundPlace] = useSound('/sound/place.mp3', { volume: Volume - .2, });

  const addTreat = async (treat) => {
    if (treat.count > 0) {
      setActiveTreats([treat])
      treat.count -= 1
      soundPlace();
      setTimeout(async () => {
        const amountOfCats = generateRandomNumber(1, 3);
        await generateCats(cats, amountOfCats)
      }, 1500);
    }
  }

  const setOfferings = async (offerings) => {
    const updatedOfferings = currentOfferings.map(offering => ({
      ...offering,
      state: true
    }));
    setCurrentOfferings(updatedOfferings);
  }

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      if (isWalletConnected) {
        await fetchAllData();
      }
      setLoading(false);
    };
    
    initializeApp();
  }, [isWalletConnected])

  // Mobile touch handlers
  useEffect(() => {
    if (isMobile && isTouchDevice()) {
      addMobileTouchListeners();
      
      return () => {
        removeMobileTouchListeners();
      };
    }
  }, [isMobile]);

  useEffect(() => {
    const storedTreats = JSON.parse(localStorage.getItem('treats')) || getHardcodedTreats();
    setCurrentTreats(storedTreats);
    const storedIngredients = JSON.parse(localStorage.getItem('ingredients')) || getHardcodedItems();
    setCurrentItems(storedIngredients);
  }, []);

  useEffect(() => {
    localStorage.setItem('treats', JSON.stringify(currentTreats));
  }, [currentTreats]);

  useEffect(() => {
    localStorage.setItem('ingredients', JSON.stringify(currentItems));
  }, [currentItems]);

  // Show wallet connection if not connected
  if (!isWalletConnected) {
    return (
      <WalletConnect
        onConnect={handleWalletConnect}
        onDisconnect={handleWalletDisconnect}
        isConnected={isWalletConnected}
        account={walletAccount}
      />
    );
  }

  return (

    <>
      <Head>
        <title>{`${currentUser?.displayName}'s Home - Paw Pets`}</title>
      </Head>
      <Loader active={loading} />

      <main className={`${styles.main} background ${isMobile ? 'background-mobile' : ''}`} style={{ backgroundImage: (`url('/backgrounds/${background}.png')`) }}>
        <EmptySpace />

        <userContext.Provider value={{ weather, currentUser, currentOfferings, currentItems, currentTreats, setCurrentOfferings, setCurrentTreats, setOfferings, fetchTreats: getHardcodedTreats, fetchItems: getHardcodedItems, fetchOfferings: getHardcodedOfferings, bgm, bgmController, currentLeaderboard, cats, setCats, currentUserData, fetchLeaderboardUsers: getHardcodedLeaderboard, catDex, setCatDex, onDisconnect: handleWalletDisconnect, selectedKitty, setIsPlaying, isPlaying, isMobile, isTablet, isSmallMobile, isLargeMobile, orientation }}>
          {currentUser && <UserInterface location={location} onWeatherSubmit={setNewWeather} onActiveClick={addActiveItem} onWeatherChange={onWeatherChange} onTreatClick={addTreat} selectCatCard={(id) => { setCatCard(id); setSelectedKitty(cats.find(cat => cat.id === id)); }} />}
          <GameArea id="game" className={isMobile ? 'game-area-mobile' : ''}>

            {cats && cats.map((cat, i) => {
              return isMobile ? (
                <MobileCatDexCard 
                  key={i} 
                  catData={cat} 
                  show={catCard} 
                  onExit={() => { setCatCard(0) }} 
                  onCatExit={() => { setCatCard(0); setCatDex(true) }} 
                />
              ) : (
                <CatDexCard 
                  key={i} 
                  catData={cat} 
                  show={catCard} 
                  width="65%" 
                  onExit={() => { setCatCard(0) }} 
                  onCatExit={() => { setCatCard(0); setCatDex(true) }} 
                />
              )
            })}

            <Advisor selectedKitty={selectedKitty} isPlaying={isPlaying} />

            {activeItems && activeItems.map((item, i) => {
              return <Item key={i} alt={item.name} image={item.image} />
            })}

            {randomCats && randomCats.map((cat, i) => {
              return <Cat key={i} catData={cat} bottom={cat.y} right={cat.x} image={cat.img} alt={`${cat.breedName} image resting`} onClick={() => { setCatCard(cat.id); }} />
            })}

            {activetreats && activetreats.map((treat, i) => {
              return <Treats key={i} alt={treat.name} image={treat.image} />
            })}

          </GameArea>
        </userContext.Provider>

        <h2 className={styles.head} id="meowing" >meowing @ {weather && weather.name.toLowerCase()}</h2>

      </main>
    </>
  )
}