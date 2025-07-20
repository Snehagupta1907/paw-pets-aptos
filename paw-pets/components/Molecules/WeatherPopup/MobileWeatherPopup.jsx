import { AnimatePresence } from "framer-motion";
import styled from "styled-components";
import Typography from "@/components/Atoms/Text";
import { useState, useContext } from "react";
import { userContext } from "@/pages";
import { GameContext } from "@/pages/_app";
import useSound from "use-sound";
import Image from "next/image";
import toast from 'react-hot-toast';

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
    max-width: 320px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: relative;
`

const MobileHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 2px solid var(--button-light);
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

const MobileWeatherContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
`

const MobileWeatherIcon = styled.div`
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
`

const MobileLocationInput = styled.input`
    background: white;
    border: 3px solid var(--button-medium);
    border-radius: 0.8rem;
    padding: 0.8rem 1rem;
    font-size: 1rem;
    font-weight: 500;
    width: 100%;
    text-align: center;
    
    &:focus {
        outline: none;
        border-color: var(--secondary-accent);
    }
`

const MobileChangeButton = styled.button`
    background: var(--secondary-accent);
    color: white;
    border: 3px solid var(--border-hard);
    border-radius: 0.8rem;
    padding: 0.8rem 1.5rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
    
    &:hover {
        background: var(--border-hard);
        transform: translateY(-2px);
    }
`

export default function MobileWeatherPopup({
    active,
    onExit = () => { }
}) {
    const { Volume } = useContext(GameContext);
    const [sound] = useSound('/sound/page.mp3', { volume: Volume, });
    const [location, setLocation] = useState("India");
    const [temperature, setTemperature] = useState("22");
    const [weather, setWeather] = useState("clear sky");
    const [weatherIcon, setWeatherIcon] = useState("/weather-icons/clear-sky.gif");

    const handleLocationChange = () => {
        // Handle location change logic here
        toast.success('Location updated!');
        onExit();
    };

    return (
        <AnimatePresence>
            {active && (
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
                            text="Weather"
                            weight="600"
                            size="1.5rem"
                            color="var(--secondary-accent)"
                        />
                        <MobileCloseButton onClick={onExit}>
                            <Image src="/icons/exit.svg" width={20} height={20} alt="Close" />
                        </MobileCloseButton>
                    </MobileHeader>

                    <MobileWeatherContent>
                        <Typography
                            text={location}
                            weight="600"
                            size="1.3rem"
                            color="var(--black)"
                        />
                        
                        <Typography
                            text={`${temperature} °C`}
                            weight="700"
                            size="2rem"
                            color="var(--secondary-accent)"
                        />
                        
                        <Typography
                            text={weather}
                            weight="500"
                            size="1.1rem"
                            color="var(--black)"
                        />
                        
                        <MobileWeatherIcon>
                            <Image 
                                src={weatherIcon} 
                                width={80} 
                                height={80} 
                                alt="Weather"
                            />
                        </MobileWeatherIcon>
                    </MobileWeatherContent>

                    <MobileLocationInput
                        type="text"
                        placeholder="Change location..."
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                    
                    <MobileChangeButton onClick={handleLocationChange}>
                        Update Location
                    </MobileChangeButton>
                </MobilePopupContainer>
            </MobilePopupOverlay>
            )}
        </AnimatePresence>
    )
} 